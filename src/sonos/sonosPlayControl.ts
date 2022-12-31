import { SonosDevice } from "@svrooij/sonos/lib"
import { PLAYING_OFFSET_MS } from "../config"
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
        track: info.Track - 1,
        secondsInTrack: timeStringToSeconds(info.RelTime),
        duration_s: timeStringToSeconds(info.TrackDuration)
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

export async function getPlayingState(): Promise<boolean> {
    logger.log("getPlayingState()")
    const d = await device()
    const state = await getState(d)
    return state === "PLAYING"
}

export async function getPlaying(): Promise<{
    now: { spotifyUri: string, startDate: Date, duration_s: number }
    next?: { spotifyUri: string }
} | undefined> {
    logger.log("getPlayingSpotifyUri()")
    const d = await device()
    try {
        const s_now = Date.now()
        const info = await getPositionInfo(d)
        const queue = await getQueue(d)

        const offset = Number(PLAYING_OFFSET_MS) || 0
        const now = {
            spotifyUri: info.uri,
            startDate: new Date(s_now - info.secondsInTrack * 1000 + offset),
            duration_s: info.duration_s
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

    // purge unwanted tracks
    try {
        for (let i = queue.length - 1; i > info.track; i--)
            await removeFromQueue(d, i)
    } catch (error) {
        logger.error(`Error removing tracks from queue: ${error}`)
    }

    // add new track
    await d.AddUriToQueue(uri)
}
