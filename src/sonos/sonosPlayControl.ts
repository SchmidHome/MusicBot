import { SonosDevice } from "@svrooij/sonos/lib"
import { device, logger, sonosToSpotifyUri } from "./sonos"

function timeStringToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(":").map(Number)
    return hours * 3600 + minutes * 60 + seconds
}

async function getState(d: SonosDevice) {
    const state = await d.AVTransportService.GetTransportInfo()
    return state.CurrentTransportState
}
async function getPositionInfo(d: SonosDevice) {
    const info = await d.AVTransportService.GetPositionInfo()
    return {
        uri: sonosToSpotifyUri(info.TrackURI),
        secondsInTrack: timeStringToSeconds(info.RelTime),
        track: info.Track - 1,
    }
}

async function getQueue(d: SonosDevice) {
    const queue = await (await d.GetQueue()).Result
    if (typeof queue === "string") {
        logger.warn(`getQueue() returned string: ${queue}`)
        return []
    }
    return queue.map((track) => sonosToSpotifyUri(track.TrackUri!))
}

function removeFromQueue(d: SonosDevice, index: number) {
    return d.AVTransportService.RemoveTrackFromQueue({ InstanceID: 0, ObjectID: `Q:0/${index + 1}`, UpdateID: 0 })
}

export async function getPlaying(): Promise<{
    now: { spotifyUri: string, startDate: Date }
    next?: { spotifyUri: string }
} | "PAUSED" | undefined> {
    logger.log("getPlayingSpotifyUri()")
    const d = await device()
    try {
        // let info = await d.AVTransportService
        const state = await getState(d)
        if (state !== "PLAYING") return "PAUSED"
        const info = await getPositionInfo(d)
        const queue = await getQueue(d)

        const now = {
            spotifyUri: info.uri,
            startDate: new Date(Date.now() - Number(info.secondsInTrack * 1000))
        }
        let next = undefined
        if (queue.length > info.track + 1) {
            next = {
                spotifyUri: queue[info.track + 1]
            }
            if (queue.length > info.track + 2) {
                // purge unwanted tracks
                try {
                    for (let i = queue.length - 1; i > info.track + 1; i--)
                        await removeFromQueue(d, i)
                } catch (error) {
                    logger.error(`Error removing tracks from queue: ${error}`)
                }
            }
        }

        return { now, next }
    } catch (error) {
        return undefined
    }
}

export async function applyNextSpotifyUri(uri: string): Promise<void> {
    logger.log(`applyNextSpotifyUri(${uri})`)
    const d = await device()

    const info = await getPositionInfo(d)
    const queue = await getQueue(d)

    let purgeEnd = info.track + 1

    // check if next track is added but not the one we want
    if (queue.length > info.track + 1 && queue[info.track + 1] !== uri) {
        purgeEnd = info.track
    }

    // purge unwanted tracks
    try {
        for (let i = queue.length - 1; i > purgeEnd; i--)
            await removeFromQueue(d, i)
    } catch (error) {
        logger.error(`Error removing tracks from queue: ${error}`)
    }

    // add new track
    if (queue.length <= info.track + 1 || queue[info.track + 1] !== uri)
        await d.AddUriToQueue(uri)
}
