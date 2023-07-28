import { startAPI } from "./api/api";
import { ConsoleLogger } from "./lib/logger";
import usedPlayer from "./player/usedPlayer";
import { getNew, getNext, getPlaying, getQueued } from "./queue/getter";
import { addSong, setPlayStartTime, setType } from "./queue/setter";
import { sortQueue, updateTime } from "./queue/sort";
import { getSongFromBackgroundPlaylist } from "./spotify/backgroundPlaylist";
import { getSong } from "./spotify/songCache";

const logger = new ConsoleLogger("index");

let nextCounter = 0;
async function checkPlaying() {
  const { now, next, paused } = await usedPlayer.getPlayingState();

  await sortQueue();

  // check playing
  let queuePlayingSong = await getPlaying();

  if (now) {
    if (!queuePlayingSong || queuePlayingSong.songUri !== now.songUri) {
      // new Song is playing
      if (queuePlayingSong) await setType(queuePlayingSong._id, "played");

      const queueNextSong = await getNext();
      if (queueNextSong && queueNextSong.songUri === now?.songUri) {
        logger.log("next is now playing");
        queuePlayingSong = queueNextSong;
      } else {
        if (queueNextSong) {
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
    }
    await setType(queuePlayingSong._id, "now");

    // check next
    let queueNextSong = await getNext();

    // check if next exists and the last 90 seconds are playing or music is paused
    const nowSong = await getSong(now.songUri);
    const timeLeft = now.startDate.getTime() + nowSong.duration_ms - Date.now();

    logger.debug(`time left:  ${timeLeft / 1000}s`);

    if ((!queueNextSong && timeLeft < 90 * 3 * 1000) || paused) {
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

    await setPlayStartTime(queuePlayingSong._id, now.startDate);
    await updateTime();
  } else {
    // initial start
    logger.log("initializing with first song");
    if (!queuePlayingSong) {
      queuePlayingSong =
        (await getNext()) || (await getQueued())[0] || (await getNew())[0];
      if (!queuePlayingSong) {
        const newSong = await getSongFromBackgroundPlaylist();
        if (!newSong) {
          logger.error("no next, no queue, default playlist empty");
          return;
        }
        queuePlayingSong = await addSong(newSong.songUri);
        logger.log("added from default playlist");
      }
      await setType(queuePlayingSong._id, "now");
    }
    await usedPlayer.setNext(queuePlayingSong.songUri);
  }
}

// check arguments
const startArg = process.argv[2];

if (startArg) {
  switch (startArg) {
    case "check-db":
      logger.log("Checking database");
      setTimeout(() => {
        logger.log("Done");
        process.exit(0);
      }, 1000);
      break;
    default:
      logger.error("Unknown argument");
      break;
  }
} else {
  startAPI();

  setTimeout(checkPlaying, 2 * 1000);
  setInterval(checkPlaying, 20 * 1000);
}
