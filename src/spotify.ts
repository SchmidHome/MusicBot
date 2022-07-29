import SpotifyWebApi from 'spotify-web-api-node'
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from './config'
import { Song } from './types'

const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
})

export async function querySong(song: string): Promise<Song | undefined> {
    const tracks = (await spotify.searchTracks(song)).body.tracks?.items || []
    
    if (tracks.length === 0)
        return undefined
    const track = tracks[0]
    return {
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        imageUri: track.album.images[0].url,
        spotifyUri: track.uri
    }
}

// ############################################## 
async function spotify_token() {
    let token = (await spotify.clientCredentialsGrant()).body;
    spotify.setAccessToken(token.access_token);
    console.log("Token refreshed");
    setTimeout(spotify_token, (token.expires_in - 30) * 1000);
}
spotify_token();
