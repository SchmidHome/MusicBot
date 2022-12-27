import SpotifyWebApi from 'spotify-web-api-node'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './config'
import { Cached, Lyrics, Playlist, Song } from './types'
import { assertIsNotNullOrUndefined, between } from './helper'
import { ConsoleLogger } from './logger'
import { db } from './mongodb'

import fetch from "node-fetch"
import { QueueElement } from './classes/queueElement'

const logger = new ConsoleLogger("spotify")

const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
})

const backgroundPlaylists = db.collection<{
    name: string,
    uri: string,
    selected: boolean
}>('backgroundPlaylists')


export function getBackgroundPlaylists() {
    return backgroundPlaylists.find({}).toArray()
}

const playlistCache = db.collection<Cached<Playlist>>('playlistCache')

export async function getPlaylist(uri: string, name: string) {
    const id = uri.slice(34, 56)
    const playlist = await playlistCache.findOne({ id })
    if (playlist && playlist.validUntil > Date.now()) {
        logger.log(`cached playlist ${uri}`)
        return playlist
    } else {
        logger.log(`loading playlist ${uri}`)
        const songs: Song[] = []
        let offset = 0
        let result
        do {
            result = (await spotify.getPlaylistTracks(id, { offset })).body
            songs.push(...await Promise.all(
                result.items.filter(e => e.track)
                    .map(e => trackToSong(e.track!))
            ))
            // logger.log(`Loaded ${songs.length} songs...`)
            offset = result.offset + result.limit
        } while (result.next);

        const newPlaylist = {
            id,
            name,
            songs,
            validUntil: Date.now() + 1000 * 60,
        }
        await playlistCache.updateOne({ id }, { $set: newPlaylist }, { upsert: true })
        return newPlaylist
    }
}

export async function getActiveBackgroundPlaylist(): Promise<{ id: string, songs: Song[], name: string } | undefined> {
    let selected = await backgroundPlaylists.findOne({ selected: true })
    if (selected == undefined) { return undefined }
    const playlist = await getPlaylist(selected.uri, selected.name)
    assertIsNotNullOrUndefined(playlist)
    return playlist
}

export function addBackgroundPlaylist(name: string, uri: string) {
    return backgroundPlaylists.insertOne({
        name, uri, selected: false
    })
}

export async function selectBackgroundPlaylist(name: string) {
    await backgroundPlaylists.updateMany({}, { $set: { selected: false } })
    await backgroundPlaylists.updateOne({ name }, { $set: { selected: true } })
}

// ############################################## CONVERT/FIND

const songCache = db.collection<Cached<Song>>('songCache')

let allowedRequests = 0
setInterval(() => {
    allowedRequests = 10
}, 2000)
export async function getSong(uri: string): Promise<Song> {
    const cachedSong = await songCache.findOne({ spotifyUri: uri })

    if (cachedSong && cachedSong.validUntil > Date.now()) {
        return cachedSong
    } else {
        while (allowedRequests <= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        allowedRequests--
        const id = uri.slice(-22)
        logger.log("        get songs", id)
        const track = await spotify.getTrack(id)

        const song = await trackToSong(track.body)
        return song
    }
}

const lyricsCache = db.collection<Cached<Lyrics>>('lyricsCache')
export async function getLyrics(uri: string): Promise<Lyrics> {
    const cachedLyrics = await lyricsCache.findOne({ spotifyUri: uri })

    if (cachedLyrics && cachedLyrics.validUntil > Date.now()) {
        return cachedLyrics
    } else {
        const id = uri.slice(-22)
        const lyrics_url = 'http://127.0.0.1:8000/index.php?trackid=' + id
        const res = await fetch(lyrics_url)
        const json = await res.json()
        await lyricsCache.updateOne({ spotifyUri: uri }, { $set: { ...json, validUntil: Date.now() + 1000 * 60 * 60 * 24 * 7 } }, { upsert: true })
        return json.lyrics
    }
}

async function trackToSong(track: SpotifyApi.TrackObjectFull) {
    const song = {
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        imageUri: track.album.images[0].url,
        spotifyUri: track.uri,
        duration_ms: track.duration_ms,
    }
    await songCache.updateOne({ spotifyUri: track.uri }, { $set: { ...song, validUntil: Date.now() + 1000 * 60 * 60 * 24 * 7 } }, { upsert: true })
    return song
}

async function querySong(song: string, offset: number, limit: number): Promise<Song[]> {
    const tracks = (await spotify.searchTracks(song, { limit, offset })).body.tracks?.items || []
    return Promise.all(tracks.map(trackToSong))
}

const searchCache = db.collection<{
    str: string,
    results: Song[],
    end: boolean,
    validUntil: number
}>("searchCache")

export async function querySpotify(searchText: string, searchIndex = 0): Promise<Song | undefined> {
    const result = await searchCache.findOne({ str: searchText })
    if (result && result.validUntil > Date.now() && result.results.length > searchIndex) {
        return result.results[searchIndex]
    } else if (result && result.validUntil > Date.now() && result.end) {
        return undefined
    } else {
        const songN = await querySong(searchText, result?.results.length || 0, searchIndex + 5)
        const song = [...(result?.results || []), ...songN]
        await searchCache.insertOne({
            str: searchText,
            results: song,
            end: songN.length == 0,
            validUntil: Date.now() + 5 * 60 * 1000
        })
        if (song.length <= searchIndex) return undefined
        return song[searchIndex]
    }
}

export function songToString(song: Song, withSongImage: boolean) {
    return `*${song?.name}*\n${song?.artist}` + (withSongImage ? `\n${song?.imageUri}` : "")
}

// ############################################## MAIN

async function setup() {
    let token = (await spotify.clientCredentialsGrant()).body;
    spotify.setAccessToken(token.access_token);
    logger.log("Token refreshed");
    setTimeout(setup, (token.expires_in - 30) * 1000);
}
setup()

export async function getSongFromDefaultPlaylist() {
    try {
        const playlist = await getActiveBackgroundPlaylist()
        if (playlist == undefined) {
            logger.warn(`No default playlist selected.`)
            return
        }

        logger.log(`Getting track from ${playlist.name}`)
        const song = await getNewTrack(playlist.songs)
        if (song == undefined) {
            logger.warn(`No new track found in ${playlist.name}`)
            selectBackgroundPlaylist("Johannes Partymix")//!
            return
        }
        return song

    } catch (error) {
        logger.error(error);
    }
}

// return the next track number if song has not played recently. Make sure Playlist has more than 10 Songs!
async function getNewTrack(playlist: Song[]): Promise<Song | undefined> {
    let i = between(0, playlist.length)
    const iStart = i

    while (await QueueElement.songPlayedRecently(playlist[i])) {
        i++
        if (i >= playlist.length) i = 0
        if (i == iStart) return undefined
    }
    logger.log(`${playlist[i].name} (${playlist[i].artist}) selected`)
    return playlist[i]
}
