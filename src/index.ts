import { getQueue, getVolume } from "./sonos"
import { addTrackFromDefaultPlaylist } from "./spotify"
import startTelegram from "./telegram"
import startExpress from "./webserver"

console.clear()

startExpress()
startTelegram()

async function checkQueue() {
    const queue = await getQueue()
    if (queue.length < 1) {
        await addTrackFromDefaultPlaylist()
    }
}

setTimeout(checkQueue, 2 * 1000)
setInterval(checkQueue, 20 * 1000)
