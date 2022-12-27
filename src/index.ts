import { QueueElement } from "./classes/queueElement"
import { ConsoleLogger } from "./logger"
import { getPlaying, getPlayingState } from "./sonos/sonosPlayControl"
import { registerCommands } from "./telegram/telegram"
import startExpress from "./webserver"

// console.clear()

startExpress()
registerCommands()


const logger = new ConsoleLogger("index")



async function checkPlaying() {
    const playingState = await getPlayingState()
    if (!playingState) {
        // paused
        logger.log("paused")
    }

    const playing = await getPlaying()
    if (!playing) {
        // nothing is playing
        logger.log("nothing is playing")
        return
    }

    const playingElement = await QueueElement.getPlaying()

    if (!playingElement || playingElement.spotifyUri !== playing.spotifyUri) {
        // new Song is playing
        await playingElement?.setPosition("played")

        const next = await QueueElement.getNext()
        if (next && next.spotifyUri === playing.spotifyUri) {
            await next.setPosition("playing")
            logger.log("new Song is playing, is next")
            return
        } else if (next) {
            next?.setPosition("new")
            logger.warn("new Song is playing, but not next")
        }

        const queue = await QueueElement.getQueue()
        const queueElement = queue.find(e => e.spotifyUri === playing.spotifyUri)
        if (queueElement) {
            await queueElement.setPosition("playing")
            logger.log("new Song is playing, found in queue")
            return
        }

        await QueueElement.createPlayingQueueElement(playing.spotifyUri)
        logger.warn("new Song is playing, not in queue")

    } else {
        // same Song is playing, update time
        await playingElement.setPlayStartTime(playing.startDate)
        await QueueElement.updateTime()
    }
}

setTimeout(checkPlaying, 2 * 1000)
setInterval(checkPlaying, 10 * 1000)
