import { BLACKLIST } from "../lib/config";
import { ConsoleLogger } from "../lib/logger";
import { Song } from "../spotify/song";
import { queueCollection } from "./queue";

const logger = new ConsoleLogger("playedRecently");

export async function playedRecently(song: Song) {
  //TODO fix
  logger.debug(`checking ${song.name}`);

  // check blacklist
  if (BLACKLIST.includes(song.songUri.split(":", 3)[2])) {
    logger.debug(`blacklisted ${song.name}`);
    return true;
  }

  // check last played
  let elements = await queueCollection
    .find({ songUri: song.songUri })
    .toArray();
  if (elements.length === 0) {
    return false;
  }

  let now = new Date();
  for (let element of elements) {
    if (element.type === "played") {
      // check if played in the last 6 hours
      if (
        element.playStartTime &&
        element.playStartTime.getTime() + 1000 * 60 * 60 * 6 > now.getTime()
      ) {
        if (
          song.name === "Fireflies" &&
          element.playStartTime.getTime() + 1000 * 60 * 60 * 2 < now.getTime()
        ) {
          return false;
        }
        return true;
      }
      // fireflies can be played all 2 hours
    } else if (element.type === "removed") {
      // ignore removed songs
    } else {
      // in queue or playing, return true
      return true;
    }
  }

  //TODO check similar titles
  return false;
}
