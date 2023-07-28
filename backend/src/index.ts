import { startAPI } from "./api/api";
import { ConsoleLogger } from "./lib/logger";
import usedPlayer from "./player/usedPlayer";
import { getNew, getNext, getPlaying, getQueued } from "./queue/getter";
import {
  addSong,
  setPlayStartTime,
  setPosition,
  setType,
} from "./queue/setter";
import { sortQueue, updateTime } from "./queue/sort";
import { getSongFromBackgroundPlaylist } from "./spotify/backgroundPlaylist";
import { getSong } from "./spotify/songCache";

startAPI();

const logger = new ConsoleLogger("controller");

let nextCounter = 0;
async function checkPlaying() {
  const { now, next, paused } = await usedPlayer.getPlayingState();
  if (!now) {
    // nothing is playing
    logger.log("nothing is playing");
    return;
  }

  await sortQueue();

  // check playing
  let queuePlayingSong = await getPlaying();

  if (!queuePlayingSong || queuePlayingSong.songUri !== now.songUri) {
    // new Song is playing
    if (queuePlayingSong) await setType(queuePlayingSong._id, "played");

    const next = await getNext();
    if (next && next.songUri === now.songUri) {
      logger.log("next is now playing");
      queuePlayingSong = next;
    } else {
      if (next) {
        logger.warn("new Song is playing, but not next");
      } else {
        logger.warn("new Song is playing, no next found");
      }

      const queue = [...(await getQueued()), ...(await getNew())];
      const queueElement = queue.find((e) => e.songUri === now.songUri);
      if (queueElement) {
        logger.log("new Song is playing, found in queue");
        queuePlayingSong = queueElement;
      } else {
        logger.warn("new Song is playing, not in queue");
        queuePlayingSong = await addSong(now.songUri);
      }
    }
    await setType(queuePlayingSong._id, "now");
  }
  await setPlayStartTime(queuePlayingSong._id, now.startDate);
  await updateTime();

  // check next
  let queueNextSong = await getNext();

  // check if next exists and the last 90 seconds are playing or music is paused
  if (
    !queueNextSong &&
    (now.startDate.getTime() +
      (await getSong(now.songUri)).duration_ms -
      Date.now() <
      90 * 1000 ||
      paused)
  ) {
    // set new next
    const queue = await getQueued();
    if (queue.length > 0) {
      queueNextSong = queue[0];
      logger.log("add next from queue");
    } else {
      const newSong = await getSongFromBackgroundPlaylist();
      if (!newSong) {
        logger.error("no next, no queue, default playlist empty");
        return;
      }
      queueNextSong = await addSong(newSong.songUri);
      logger.log("add next from default playlist");
    }
    await setType(queueNextSong._id, "next");
  }

  if (nextCounter > 0) nextCounter--;
  if (queueNextSong && queueNextSong.songUri !== next?.songUri) {
    // set new next
    if (nextCounter === 0) {
      nextCounter = 4;
      await usedPlayer.setNext(queueNextSong.songUri);
    }
  }
}

setTimeout(checkPlaying, 2 * 1000);
setInterval(checkPlaying, 20 * 1000);
