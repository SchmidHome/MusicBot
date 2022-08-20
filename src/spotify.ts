import SpotifyWebApi from 'spotify-web-api-node'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './config'
import { Song } from './types'
import { between } from './helper'
import { addToQueue, getAllSongs } from './sonos'

const CT = "[SPOTIFY] "
function log(msg: string, ...args: any[]) {
    console.log(CT + msg, ...args)
}


const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
})

const backgroundPlaylistLink = "https://open.spotify.com/playlist/7hw2TUqBB7h3OEDakMZ2J9?si=add0308425124cb6"

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
        log("Adding track from default playlist")
        const playlist = (await spotify.getPlaylistTracks(backgroundPlaylistLink.slice(34, 56))).body;
        if (playlist == null) { return }
        const track = playlist.items[await getNewTrackNumber(playlist)].track
        if (track == null) { return }
        await addToQueue(track.uri)
    } catch (error) {
        console.error(error);
    }
}
const cashedSongs: { [uri: string]: Song } = {}

let allowedRequests = 10
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
            log("Getting song", id)
            const track = await spotify.getTrack(id)
            cashedSongs[uri] = trackToSong(track.body)
        }
    }
    return cashedSongs[uri];
}

// return the next track number if song has not played recently. Make sure Playlist has more than 10 Songs!
async function getNewTrackNumber(playlist: SpotifyApi.PlaylistTrackResponse) {
    const newTrackNumber = between(0, playlist.items.length)
    const track = playlist.items[between(0, playlist.items.length)].track
    if (track == undefined) { throw new Error("Track is undefined") }
    const uri = track.uri
    if (await songPlayedRecently(uri)) {
        getNewTrackNumber(playlist)
    }
    return newTrackNumber
}

// checks if the song was one of the last 10 songs
export async function songPlayedRecently(uri: string) {
    const recentlyPlayed = (await getAllSongs()).slice(-10)
    log("Song has played recently: " + (await (await recentlyPlayed).includes(uri)))
    return (await (await recentlyPlayed).includes(uri))
}
