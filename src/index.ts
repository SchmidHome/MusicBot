import { getAllSongs, getCurrentTrack, getPlayingState, getPositionInAllSongs, getQueue, playSong } from "./sonos"
import { addTrackFromDefaultPlaylist } from "./spotify"
import startTelegram from "./telegram"
import startExpress from "./webserver"

console.clear()

startExpress()
startTelegram()

async function checkQueue() {
    const playing = await getCurrentTrack()
    if (playing) {
        if (await getPositionInAllSongs(playing) === 0) {
            if (!await getPlayingState()) {
                console.log("Playlist ran out, add new track and continue")

                const oldQueue = await getAllSongs()

                await addTrackFromDefaultPlaylist()

                await new Promise(resolve => setTimeout(resolve, 5 * 1000))
                // continue
                await playSong(oldQueue.length)

            }
        }
    }

    const queue = await getQueue()
    if (queue.length < 1) {
        await addTrackFromDefaultPlaylist()
    }
}

setTimeout(checkQueue, 2 * 1000)
setInterval(checkQueue, 20 * 1000)
