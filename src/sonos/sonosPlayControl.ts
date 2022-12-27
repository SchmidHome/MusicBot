import { device, logger, sonosToSpotifyUri } from "./sonos"

function timeStringToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(":").map(Number)
    return hours * 3600 + minutes * 60 + seconds
}

export async function getPlaying(): Promise<{ spotifyUri: string, startDate: Date } | undefined> {
    logger.log("getPlayingSpotifyUri()")
    const d = await device()
    try {
        let info = await d.AVTransportService.GetPositionInfo()
        return {
            spotifyUri: sonosToSpotifyUri(info.TrackURI),
            startDate: new Date(Date.now() - Number(timeStringToSeconds(info.RelTime) * 1000))
        }
    } catch (error) {
        return undefined
    }
}

export async function getPlayingState(): Promise<boolean> {
    logger.log("getPlayingState()")
    const state = await (await device()).AVTransportService.GetTransportInfo()
    logger.debug(state)
    return state.CurrentTransportState === "now"
}

export async function addNextSpotifyUri(uri: string): Promise<void> {
    logger.log(`addNextSpotifyUri(${uri})`)
    await (await device()).AddUriToQueue(uri)
}



// export async function playLastSong(): Promise<boolean> {
//     logger.log("playLastSong()")
//     const d = await device()
//     const posInfo = await d.AVTransportService.GetPositionInfo()


//     await d.AVTransportService.Seek({
//         InstanceID: 0,
//         Unit: "TRACK_NR",
//         Target: String(posInfo.Track - 1)
//     })
//     await d.AVTransportService.Play({
//         InstanceID: 0,
//         Speed: "1"
//     })
//     return true
// }
