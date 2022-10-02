import SpotifyWebApi from 'spotify-web-api-node'
import { PLAYLIST_FILE, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './config'
import { Song } from './types'
import { assertIsNotNullOrUndefined, between } from './helper'
import { addToQueue, getAllSongs, getTrackInfo } from './sonos'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { ConsoleLogger } from './logger'
import { JSONFileHandler, SimpleCache } from "@idot-digital/simplecache"


const logger = new ConsoleLogger("spotify")

const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
})

// make sure data/playlists.json exists
if (!existsSync("data")) {
    mkdirSync("data")
}
if (!existsSync(PLAYLIST_FILE)) {
    writeFileSync(PLAYLIST_FILE, JSON.stringify([{
        name: "Johannes Partymix",
        uri: "https://open.spotify.com/playlist/7hw2TUqBB7h3OEDakMZ2J9?si=add0308425124cb6",
        selected: true
    }]))
}
const backgroundPlaylists = new JSONFileHandler(PLAYLIST_FILE, 1000)


export async function getBackgroundPlaylists(): Promise<{ name: string, uri: string, selected: boolean }[]> {
    return await backgroundPlaylists.get()
}

export const playlistCache = new SimpleCache(60000, async (uri: string) => {
    const id = uri.slice(34, 56)
    // const playlist = await spotify.getPlaylist(id)
    logger.log(`loading playlist ${id}`)

    const songs: Song[] = []
    let offset = 0
    let result
    do {
        result = (await spotify.getPlaylistTracks(id, { offset })).body
        songs.push(...result.items.filter(e => e.track).map(e => trackToSong(e.track!)))
        // logger.log(`Loaded ${songs.length} songs...`)
        offset = result.offset + result.limit
    } while (result.next);

    return (await spotify.getPlaylistTracks(id)).body
})

export async function getActiveBackgroundPlaylist(): Promise<{ songs: Song[], name: string } | undefined> {
    let selected = (await getBackgroundPlaylists()).find(e => e.selected)
    if (selected == undefined) { return undefined }
    const playlist = await playlistCache.get(selected.uri)
    assertIsNotNullOrUndefined(playlist)
    return {
        songs: playlist.items.filter(e => e.track).map(e => trackToSong(e.track!)),
        name: selected.name
    }
}

export async function addBackgroundPlaylist(name: string, uri: string) {
    const list = await getBackgroundPlaylists()
    list.push({ name, uri, selected: false })
    backgroundPlaylists.set(list)
}

export async function selectBackgroundPlaylist(name: string) {
    const list = await getBackgroundPlaylists()
    list.forEach(e => e.selected = e.name == name)
    backgroundPlaylists.set(list)
}

// ############################################## CONVERT/FIND
const cashedSongs: { [uri: string]: Song } = {}

let allowedRequests = 0
setInterval(() => {
    allowedRequests = 10
}, 2000)
export async function uriToSong(uri: string): Promise<Song> {
    if (!cashedSongs[uri]) {
        while (allowedRequests <= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        if (!cashedSongs[uri]) {
            allowedRequests--
            const id = uri.slice(-22)
            logger.log("        get songs", id)
            const track = await spotify.getTrack(id)
            trackToSong(track.body)
        }
    }
    return cashedSongs[uri];
}

function trackToSong(track: SpotifyApi.TrackObjectFull): Song {
    const song = {
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        imageUri: track.album.images[0].url,
        spotifyUri: track.uri,
        duration: track.duration_ms,
    }
    cashedSongs[track.uri] = song
    return song
}

export async function querySong(song: string): Promise<Song | undefined> {
    const tracks = (await spotify.searchTracks(song)).body.tracks?.items || []

    if (tracks.length === 0)
        return undefined
    const track = tracks[0]
    return trackToSong(track)
}

// ############################################## MAIN

async function setup() {
    let token = (await spotify.clientCredentialsGrant()).body;
    spotify.setAccessToken(token.access_token);
    logger.log("Token refreshed");
    setTimeout(setup, (token.expires_in - 30) * 1000);
}
setup()

export async function addTrackFromDefaultPlaylist() {
    try {
        const playlist = await getActiveBackgroundPlaylist()
        if (playlist == undefined) {
            logger.warn(`No default playlist selected.`)
            return
        }

        logger.log(`Adding track from ${playlist.name}`)
        const song = await getNewTrack(playlist.songs)
        if (song == undefined) {
            logger.warn(`No new track found in ${playlist.name}`)
            selectBackgroundPlaylist("Johannes Partymix")
            return
        }
        await addToQueue(song.spotifyUri)
    } catch (error) {
        logger.error(error);
    }
}

// return the next track number if song has not played recently. Make sure Playlist has more than 10 Songs!
async function getNewTrack(playlist: Song[]): Promise<Song | undefined> {
    let i = between(0, playlist.length)
    const iStart = i

    while (await songPlayedRecently(playlist[i].spotifyUri)) {
        i++
        if (i >= playlist.length) i = 0
        if (i == iStart) return undefined
    }
    logger.log(`${playlist[i].name} (${playlist[i].artist}) selected`)
    return playlist[i]
}

// checks if the song was one of the last 20 songs
export async function songPlayedRecently(uri: string) {
    const recentlyPlayed = (await getAllSongs()).slice(-20 - (await getTrackInfo()).Track)
    return recentlyPlayed.includes(uri)
}
