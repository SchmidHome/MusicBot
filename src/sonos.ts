import { SonosManager } from "@svrooij/sonos"
import { isString } from "./helper"
import { SimpleCache } from "@idot-digital/simplecache"
import { GetPositionInfoResponse } from "@svrooij/sonos/lib/services"
import { getSongFromUri } from "./spotify"
import { ConsoleLogger } from "./logger"

const logger = new ConsoleLogger("sonos")


const manager = new SonosManager()
manager.InitializeFromDevice(process.env.SONOS_HOST || '192.168.1.207')
    .then(() => {
        manager.Devices.forEach(d => logger.log('Device %s (%s) is joined in %s', d.Name, d.Host, d.GroupName))
    })

const deviceName = "0 Wohnzimmer"

async function device(name = deviceName) {
    const d = manager.Devices.find(d => d.Name === name)
    if (!d) {
        throw new Error(`Device ${name} not found`)
    }
    return d.Coordinator
}

// ############################################## CACHE

const trackinfoCache = new SimpleCache(5000, async (_) => await (await device()).AVTransportService.GetPositionInfo())
const queueCache = new SimpleCache(10000, async (_) => {
    let _queue = (await (await device()).GetQueue()).Result
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
    logger.log("getCurrentTrack()")
    return sonosToSpotifyUri((await getTrackInfo()).TrackURI)
}

export async function getQueue(): Promise<string[]> {
    logger.log("getQueue()")
    let _queue = await getAllSongs()
    const posInfo = await getTrackInfo()

    const running = posInfo.Track
    return _queue.slice(running)
}

export async function getPositionInQueue(uri: string): Promise<number> {
    const queue = await getQueue()
    return queue.indexOf(uri)
}

export async function getPositionInAllSongs(uri: string): Promise<number> {
    const queue = await getAllSongs()
    return queue.indexOf(uri)
}

export async function getScheduledTime(uri: string): Promise<Date> {
    const now = Date.now()
    const queue = await getQueue();
    const posInfo = await getTrackInfo()

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
        logger.log(`addToQueue(${uri})`)
        await (await device()).AddUriToQueue(uri, 1e6)
        queueCache.remove("")
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

export async function removeFromQueue(uri: string): Promise<boolean> {
    try { //TODO fix this
        logger.log(`removeFromQueue(${uri})`)
        let pos = await getPositionInAllSongs(uri)
        if (pos === -1) {
            logger.log("can not remove ", uri)
            return false
        }
        logger.log("removing from queue ", uri)

        const UpdateID = (await (await device()).GetQueue()).UpdateID
        logger.log("UpdateID: ", UpdateID)

        let d = await device()

        await d.QueueService.RemoveTrackRange({
            QueueID: 0,
            UpdateID: UpdateID,
            StartingIndex: await getPositionInAllSongs(uri),
            NumberOfTracks: 1
        })
        queueCache.remove("")
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}

let targetVolume: number | undefined = undefined

export async function getVolume(): Promise<number> {
    if (targetVolume === undefined) {
        logger.log("getVolume()")
        const d = await device()
        targetVolume = (await d.GroupRenderingControlService.GetGroupVolume({ InstanceID: 0 })).CurrentVolume
    }
    return targetVolume
}

export async function setVolume(volume: number): Promise<boolean> {
    logger.log(`setVolume(${volume})`)
    targetVolume = volume
    return await applyVolume()
}

async function applyVolume() {
    const target = targetVolume
    if (target === undefined) return false
    const d = await device()
    let members = (await d.GetZoneGroupState()).find(v => v.coordinator.name == deviceName)?.members
    if (!members) return false
    return (await Promise.all(members.map(async (member) => (await device(member.name)).SetVolume(target)))).reduce((acc, v) => acc && v, true)
}

// async function setTouchControls() {
//     const d = await device()
//     let members = (await (await device()).GetZoneGroupState()).find(v => v.coordinator.name == deviceName)?.members
//     if (!members) return false
//     return (await Promise.all(members.map(async (member) =>
//         (await device(member.name)).)))
//         .reduce((acc, v) => acc && v, true)

// }

setTimeout(getVolume, 1000)
// setInterval(applyVolume, 10000)
