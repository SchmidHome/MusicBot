import { QueueElement } from "./classes/queueElement"
import { ConsoleLogger } from "./logger"
import { applyNextSpotifyUri, getPlaying } from "./sonos/sonosPlayControl"
import { getSongFromDefaultPlaylist } from "./spotify"
import { registerCommands } from "./telegram/telegram"
import startExpress from "./webserver"

startExpress()
registerCommands()

const logger = new ConsoleLogger("index")

async function checkPlaying() {
    const playing = await getPlaying()
    if (!playing) {
        // nothing is playing
        logger.log("nothing is playing")
        return
    } else if (playing === "PAUSED") {
        // paused
        logger.log("paused")
        return
    }

    // check playing
    let playingElement = await QueueElement.getPlaying()

    if (!playingElement || playingElement.spotifyUri !== playing.now.spotifyUri) {
        // new Song is playing
        await playingElement?.setPosition("played")

        playingElement = undefined

        const next = await QueueElement.getNext()
        if (next && next.spotifyUri === playing.now.spotifyUri) {
            logger.log("next is now playing")
            playingElement = next
        } else {
            if (next) {
                logger.warn("new Song is playing, but not next")
            } else {
                logger.warn("new Song is playing, no next found")
            }

            const queue = await QueueElement.getQueue()
            const queueElement = queue.find(e => e.spotifyUri === playing.now.spotifyUri)
            if (queueElement) {
                logger.log("new Song is playing, found in queue")
                playingElement = queueElement
            } else {
                logger.warn("new Song is playing, not in queue")
                playingElement = await QueueElement.createPlayingQueueElement(playing.now.spotifyUri)
            }
        }
        await playingElement.setPosition("now")
    }
    await playingElement.setPlayStartTime(playing.now.startDate)
    await QueueElement.updateTime()

    // check next
    let nextElement = await QueueElement.getNext()

    // check if next exists and the last 60 seconds are playing
    if (!nextElement && playing.now.startDate.getTime() + playing.now.duration_s * 1000 - Date.now() < 60 * 1000) {
        // set new next
        const queue = await QueueElement.getQueue()
        if (queue.length > 0) {
            nextElement = queue[0]
            logger.log("add next from queue")
        } else {
            const newSong = await getSongFromDefaultPlaylist()
            if (!newSong) {
                logger.error("no next, no queue, default playlist empty")
                return
            }
            nextElement = await QueueElement.createNextQueueElement(newSong.spotifyUri)
            logger.log("add next from default playlist")
        }
        await nextElement.setPosition("next")
    }

    if (nextElement && nextElement.spotifyUri !== playing.next?.spotifyUri) {
        // set new next
        applyNextSpotifyUri(nextElement.spotifyUri)
    }
}

setTimeout(checkPlaying, 1 * 1000)
setInterval(checkPlaying, 10 * 1000)
