import { SonosDevice } from "@svrooij/sonos"
import { Song } from "./types"

const device = new SonosDevice("192.168.1.207")


// export async function getQueue(): Promise<Song[]> {
//     return [{ name: "test", artist: "art", album: "alb", image: "art" }] //todo
// }

function sonosToSpotifyUri(uri: string): string {
    const res = /x-sonos-spotify:spotify:track:(\w{22})?.*/.exec(uri)
    if (res === null) throw new Error("Invalid Sonos URI")
    const baseUri = res[1]
    return `spotify:track:${baseUri}`
}


export async function getCurrentTrack(): Promise<string | undefined> {
    let state = await device.GetState()
    return sonosToSpotifyUri(state.positionInfo.TrackURI)
}

export async function addToQueue(uri: string): Promise<boolean> {
    try {
        console.log("adding to queue ", uri)
        await device.AddUriToQueue(uri)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

export async function getVolume(): Promise<number> {
    return 0 //todo
}

export async function setVolume(volume: number): Promise<void> {
    return //todo
}
