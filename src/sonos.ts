import { SonosDevice, SonosDeviceDiscovery } from "@svrooij/sonos"
import { isString } from "./helper"
import { SimpleCache } from "@idot-digital/simplecache"
import { GetPositionInfoResponse } from "@svrooij/sonos/lib/services"
import { getSongFromUri } from "./spotify"

// const disc = new SonosDeviceDiscovery()


const device = new SonosDevice("192.168.1.90")
// const device = new SonosDevice("192.168.1.207")

const CT = "[ SONOS ] "
function log(msg: string, ...args: any[]) {
    console.log(CT + msg, ...args)
}

// ############################################## CACHE

const trackinfoCache = new SimpleCache(5000, async (_) => await device.AVTransportService.GetPositionInfo())
const queueCache = new SimpleCache(10000, async (_) => {
    let _queue = (await device.GetQueue()).Result
    if (typeof _queue === "string") return []
    return _queue.map(track => track.TrackUri).filter(isString).map(sonosToSpotifyUri)
})
export async function getAllSongs(): Promise<string[]> { return (await queueCache.get(""))! }
export async function getTrackInfo(): Promise<GetPositionInfoResponse> { return (await trackinfoCache.get(""))! }


// ############################################## FORMAT FUNCTIONS

export function sonosToSpotifyUri(uri: string): string {
    const res = /x-sonos-spotify:spotify:track:(\w{22})?.*/.exec(uri)
    if (res === null) throw new Error("Invalid Sonos URI")
    const baseUri = res[1]
    return `spotify:track:${baseUri}`
}

export function timeStringToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(":").map(Number)
    return hours * 3600 + minutes * 60 + seconds
}
// ############################################## FUNCTIONS

export async function getCurrentTrack(): Promise<string | undefined> {
    let state = await device.GetState() //todo use getTrackInfo()
    return sonosToSpotifyUri(state.positionInfo.TrackURI)
}

export async function getQueue(): Promise<string[]> {
    let _queue = await getAllSongs()
    const posInfo = await getTrackInfo()

    const running = posInfo.Track
    return _queue.slice(running)
}

export async function getPositionInQueue(uri: string): Promise<number> {
    const queue = await getQueue();
    return queue.indexOf(uri) + 1;
}

export async function getScheduledTime(uri: string): Promise<Date> {
    const now = Date.now()
    const queue = await getQueue();
    const posInfo = (await trackinfoCache.get(""))!

    const FaderTime = 12000 //TODO check if crossfade is enabled

    // current track
    const currentTime = (timeStringToSeconds(posInfo.TrackDuration) - timeStringToSeconds(posInfo.RelTime)) * 1000 - FaderTime

    // queue tracks
    const queueTime = (await queue.slice(0, queue.indexOf(uri)).reduce(async (acc, uri) => {
        const track = await getSongFromUri(uri)
        return await acc + track.duration - FaderTime
    }, Promise.resolve(0)))

    return new Date(now + currentTime + queueTime);
}

export async function addToQueue(uri: string): Promise<boolean> {
    try {
        log("adding to queue ", uri)
        await device.AddUriToQueue(uri)
        queueCache.remove("")
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function getVolume(): Promise<number> {
    return (await device.GroupRenderingControlService.GetGroupVolume({ InstanceID: 0 })).CurrentVolume
}

export async function setVolume(volume: number): Promise<boolean> {
    log("setting volume to ", volume)
    return device.GroupRenderingControlService.SetGroupVolume({ InstanceID: 0, DesiredVolume: volume })
}
