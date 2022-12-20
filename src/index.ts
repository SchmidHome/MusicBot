import { getAllSongs, getCurrentTrack, getPlayingState, getPositionInAllSongs, getQueue, playSong } from "./sonos"
import { addTrackFromDefaultPlaylist } from "./spotify"
import startTelegram from "./telegram"
import startExpress from "./webserver"

console.clear()

startExpress()
startTelegram()

let c = 0
async function checkQueue() {
    const playing = await getCurrentTrack()
    if (playing) {
        if (await getPositionInAllSongs(playing) === 0) {
            if (!await getPlayingState()) {
                c++
                if (c > 1) {
                    console.log("Playlist ran out, add new track and continue")

                    const oldQueue = await getAllSongs()
                    await addTrackFromDefaultPlaylist()
                    await new Promise(resolve => setTimeout(resolve, 5 * 1000))
                    // continue
                    await playSong(oldQueue.length)
                }
            } else c = 0
        } else c = 0
    } else c = 0

    const queue = await getQueue()
    if (queue.length < 1) {
        await addTrackFromDefaultPlaylist()
    }
}

setTimeout(checkQueue, 2 * 1000)
setInterval(checkQueue, 20 * 1000)
