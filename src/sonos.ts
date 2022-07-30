import { SonosDevice } from "@svrooij/sonos"
import { isNotUndefined, isString } from "./helper"
import { Song } from "./types"

const device = new SonosDevice("192.168.1.207")


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

export async function getQueue(): Promise<string[]> {
    let _queue = (await device.GetQueue()).Result
    if (typeof _queue === "string") return []

    const running = (await device.AVTransportService.GetPositionInfo()).Track
    _queue = _queue.slice(running)

    return _queue.map(track => track.TrackUri).filter(isString).map(sonosToSpotifyUri) //todo return type Song[]
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
    return (await device.GetState()).volume
}

export async function setVolume(volume: number): Promise<boolean> {
    return await device.SetVolume(volume)
}
