import { SonosManager } from "@svrooij/sonos"
import { isString } from "../helper"
import { SimpleCache } from "@idot-digital/simplecache"
import { GetPositionInfoResponse } from "@svrooij/sonos/lib/services"
import { ConsoleLogger } from "../logger"
import { SONOS_DEVICE_IP, SONOS_DEVICE_NAME } from "../config"

export const logger = new ConsoleLogger("sonos")

const manager = new SonosManager()
manager.InitializeFromDevice(SONOS_DEVICE_IP)
    .then(() => {
        manager.Devices.forEach(d => logger.log('Device %s (%s) is joined in %s', d.Name, d.Host, d.GroupName))
    })

async function getDevices() {
    // try manager.Devices 5 times with 1 second delay
    for (let i = 0; i < 5; i++) {
        try {
            return manager.Devices;
        }
        catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error("Could not get devices");
}

export async function device(name = SONOS_DEVICE_NAME, coordinator = true) {
    const d = (await getDevices()).find(d => d.Name === name);
    for (let i = 0; i < 5; i++) {
        try {
            const d = manager.Devices.find(d => d.Name === name);
            if (d)
                return coordinator ? d.Coordinator : d;
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    if (!d) {
        throw new Error(`Device ${name} not found`);
    }
    return coordinator ? d.Coordinator : d;
}

// ############################################## CACHE

// const trackInfoCache = new SimpleCache(900, async (_) => await (await device()).AVTransportService.GetPositionInfo())
// const queueCache = new SimpleCache(9000, async (_) => {
//     let _queue = (await (await device()).GetQueue()).Result
//     if (typeof _queue === "string") return []
//     return _queue.map(track => track.TrackUri).filter(isString).map(sonosToSpotifyUri)
// })
// async function getAllSongs(): Promise<string[]> { return (await queueCache.get(""))! }
// async function getTrackInfo(): Promise<GetPositionInfoResponse> { return (await trackInfoCache.get(""))! }


// ############################################## FORMAT FUNCTIONS

export function sonosToSpotifyUri(uri: string): string {
    const res = /x-sonos-spotify:spotify:track:(\w{22})?.*/.exec(uri)
    if (res === null) throw new Error("Invalid Sonos URI: " + uri)
    const baseUri = res[1]
    return `spotify:track:${baseUri}`
}

// ############################################## FUNCTIONS

// async function getQueue(): Promise<string[]> {
//     let _queue = await getAllSongs()
//     const posInfo = await getTrackInfo()

//     const running = posInfo.Track
//     return _queue.slice(running)
// }

// async function getPositionInQueue(uri: string): Promise<number> {
//     const queue = await getQueue()
//     return queue.indexOf(uri)
// }

// async function getPositionInAllSongs(uri: string): Promise<number> {
//     const queue = await getAllSongs()
//     return queue.lastIndexOf(uri)
// }
