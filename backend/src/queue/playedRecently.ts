import { BLACKLIST } from "../lib/config"
import { Song } from "../spotify/song"
import { queueCollection } from "./queue"

export  async function playedRecently(song: Song) {

    //TODO fix

    // check blacklist
    if (BLACKLIST.includes(song.songUri.split(":", 3)[2])) return true

    // check last played
    let elements = await queueCollection.find({ spotifyUri: song.songUri }).toArray()
    if (elements.length === 0) return false

    let now = new Date()
    for (let element of elements) {
        if (element.type === "played") {
            // check if played in the last 4 hours
            if (element.playStartTime && element.playStartTime.getTime() + 1000 * 60 * 60 * 4 > now.getTime()) {
                return true
            }
        } else if (element.type === "removed") {
            // ignore removed songs
        } else {
            // in queue or playing, return true
            return true
        }
    }

    //TODO check similar titles
    return false
}
