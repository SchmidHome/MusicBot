import SpotifyWebApi from 'spotify-web-api-node'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './config'
import { Song } from './types'
import { between } from './helper'
import { addToQueue, getAllSongs, getCurrentTrack, getTrackInfo } from './sonos'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

const CT = "[SPOTIFY] "
function log(msg: string, ...args: any[]) {
    console.log(CT + msg, ...args)
}

const playlistFile = "data/playlists.json"
// make sure data/playlists.json exists
if (!existsSync("data")) {
    mkdirSync("data")
}
if (!existsSync(playlistFile)) {
    writeFileSync(playlistFile, JSON.stringify([
        {
            name: "Johannes Partymix",
            uri: "https://open.spotify.com/playlist/7hw2TUqBB7h3OEDakMZ2J9?si=add0308425124cb6",
            probability: 1
        }
    ]))
}

const backgroundPlaylists: { name: string, uri: string, probability: number }[] = (() => {
    const list = JSON.parse(readFileSync(playlistFile, "utf8"))
    //multiply the probability of each playlist
    const result: { name: string, uri: string, probability: number }[] = []
    list.forEach((p: { name: string, uri: string, probability: number }) => {
        if (p.probability != Math.round(p.probability)) throw new Error("Probability must be an integer")
        if (p.probability < 0) throw new Error("Probability must be positive")
        for (let i = 0; i < p.probability; i++) {
            result.push(p)
        }
    })
    return result
})()



const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
})


// const backgroundPlaylistLink = "https://open.spotify.com/playlist/7hw2TUqBB7h3OEDakMZ2J9?si=add0308425124cb6"
// const backgroundPlaylistLink = "https://open.spotify.com/playlist/44Ic3lwwHnisSacD6SIusN?si=b4Mwd3dkRtGJmyvsgml0oQ&utm_source=whatsapp"

async function setup() {
    let token = (await spotify.clientCredentialsGrant()).body;
    spotify.setAccessToken(token.access_token);
    log("Token refreshed");
    setTimeout(setup, (token.expires_in - 30) * 1000);
}
setup()


function trackToSong(track: SpotifyApi.TrackObjectFull): Song {
    return {
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        imageUri: track.album.images[0].url,
        spotifyUri: track.uri,
        duration: track.duration_ms,
    }
}

export async function querySong(song: string): Promise<Song | undefined> {
    const tracks = (await spotify.searchTracks(song)).body.tracks?.items || []

    if (tracks.length === 0)
        return undefined
    const track = tracks[0]
    return trackToSong(track)
}

// ##############################################

export async function addTrackFromDefaultPlaylist() {
    try {
        // select random playlist depending on probability
        const playlist = backgroundPlaylists[between(0, backgroundPlaylists.length)]

        log("DEFAULT [playlist] " + playlist.name)
        const spotifyPlaylist = (await spotify.getPlaylistTracks(playlist.uri.slice(34, 56))).body;
        // (await spotify.getPlaylist(backgroundPlaylistLink.slice(34, 56))).body.name
        // console.log(playlist)
        if (spotifyPlaylist == null) { return }
        const track = await getNewTrack(spotifyPlaylist)
        await addToQueue(track.uri)
    } catch (error) {
        console.error(error);
    }
}
const cashedSongs: { [uri: string]: Song } = {}

let allowedRequests = 0
setInterval(() => {
    allowedRequests = 10
}, 2000)

export async function getSongFromUri(uri: string): Promise<Song> {
    if (!cashedSongs[uri]) {
        while (allowedRequests <= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        if (!cashedSongs[uri]) {
            allowedRequests--
            const id = uri.slice(-22)
            log("        get songs", id)
            const track = await spotify.getTrack(id)
            cashedSongs[uri] = trackToSong(track.body)
        }
    }
    return cashedSongs[uri];
}

// return the next track number if song has not played recently. Make sure Playlist has more than 10 Songs!
async function getNewTrack(playlist: SpotifyApi.PlaylistTrackResponse): Promise<SpotifyApi.TrackObjectFull> {
    const track = playlist.items[between(0, playlist.items.length)].track
    if (track == undefined) { throw new Error("Track is undefined") }
    const uri = track.uri
    if (await songPlayedRecently(uri)) {
        log("        [Track]: " + uri + " played recently")
        return getNewTrack(playlist)
    } else {
        log("        [Track]: " + uri + " adding")
        return track
    }
}

// checks if the song was one of the last 20 songs
export async function songPlayedRecently(uri: string) {
    const recentlyPlayed = (await getAllSongs()).slice(-20 - (await getTrackInfo()).Track)
    // log("        Song has played recently: " + (await (await recentlyPlayed).includes(uri)))
    return recentlyPlayed.includes(uri)
}
