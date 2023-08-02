import chalk from "chalk";
import { startAPI } from "./api/api";
import startHA, { updateColor } from "./homeassistant";
import { ConsoleLogger } from "./lib/logger";
import usedPlayer from "./player/usedPlayer";
import {
  getFullQueue,
  getNew,
  getNext,
  getPlaying,
  getQueued,
} from "./queue/getter";
import { addSong, setPlayStartTime, setType } from "./queue/setter";
import { sortQueue, updateTime } from "./queue/sort";
import { getSongFromBackgroundPlaylist } from "./spotify/backgroundPlaylist";
import { clearSongCache, getSong } from "./spotify/songCache";
import { clearColorCache } from "./color/colorCache";
import { clearPlaylistCache } from "./spotify/playlistCache";
import { clearLyricsCache } from "./spotify/lyricsCache";

const logger = new ConsoleLogger("index", chalk.white);

let nextCounter = 0;

let updateOnChange: NodeJS.Timeout | undefined;

const QUEUE_LEN = 4;

let running = false;
async function checkPlaying(initial = false) {
  if (running) return logger.warn("checkPlaying already running");
  running = true;
  const { now, next } = await usedPlayer.getPlaying(true);

  await sortQueue();

  // check playing
  let queuePlayingSong = await getPlaying();
  let oldQueuePlayingSong = queuePlayingSong;

  if (now) {
    // sync playing to queue
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
    if (initial || oldQueuePlayingSong?._id !== queuePlayingSong._id) {
      await updateColor().finally(() => (running = false));
    }

    // check next
    let queueNextSong = await getNext();

    // check if next exists and the last 90 seconds are playing or music is paused
    const nowSong = await getSong(now.songUri);
    const timeLeft = now.startDate.getTime() + nowSong.duration_ms - Date.now();

    logger.debug(`time left:  ${timeLeft / 1000}s`);

    const paused = await usedPlayer.getPaused(true);
    if (!queueNextSong && (timeLeft < 90 * 1000 || paused)) {
      // set new next
      const queue = await getQueued();
      if (queue.length > 0) {
        queueNextSong = queue[0];
        logger.log("add next from queue");
      } else {
        const newSong = await getSongFromBackgroundPlaylist();
        if (!newSong) {
          logger.error("no next, no queue, default playlist empty");
          running = false;
          return;
        }
        queueNextSong = await addSong(newSong.songUri);
        logger.log("add next from default playlist");
      }
      await setType(queueNextSong._id, "next");
    } else {
      // add more songs to queue
      let queue = (await getFullQueue()).filter((e) => e.type != "now");
      logger.debug(`queue length: ${queue.length}`);
      while (queue.length < QUEUE_LEN) {
        const newSong = await getSongFromBackgroundPlaylist();
        if (!newSong) {
          running = false;
          return;
        }
        await addSong(newSong.songUri);
        logger.log("added song from default playlist");
        queue = (await getFullQueue()).filter((e) => e.type != "now");
      }
    }

    if (nextCounter > 0) nextCounter--;
    if (queueNextSong && queueNextSong.songUri !== next?.songUri) {
      // set new next
      if (nextCounter === 0) {
        nextCounter = 2;
        await usedPlayer.setNext(queueNextSong.songUri);
      } else {
        logger.log(`not applying next for ${nextCounter} more checks`);
      }
    }

    await setPlayStartTime(queuePlayingSong._id, now.startDate);
    await updateTime();

    // add special update on change
    if (updateOnChange) clearTimeout(updateOnChange);
    updateOnChange = setTimeout(() => {
      checkPlaying().finally(() => {
        running = false;
      });
    }, Math.max(timeLeft - 6500, 2000));
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
          running = false;
          return;
        }
        queuePlayingSong = await addSong(newSong.songUri);
        logger.log("added from default playlist");
      }
      await setType(queuePlayingSong._id, "now");
    }
    await updateColor().finally(() => (running = false));
    await usedPlayer.setNext(queuePlayingSong.songUri);
  }
  running = false;
}

// check arguments
const startArg = process.argv[2];

function start() {
  startHA();
  startAPI();

  setTimeout(
    () =>
      checkPlaying(true).finally(() => {
        running = false;
      }),
    2 * 1000
  );
  setInterval(
    () =>
      checkPlaying().finally(() => {
        running = false;
      }),
    20 * 1000
  );
}

if (startArg) {
  switch (startArg) {
    case "check-db":
      logger.log("Checking database");
      setTimeout(() => {
        logger.log("Done");
        process.exit(0);
      }, 1000);
      break;
    case "clear-cache":
      setTimeout(async () => {
        logger.log("Clearing cache...");
        await clearColorCache();
        await clearSongCache();
        await clearPlaylistCache();
        await clearLyricsCache();
        logger.log("Done");
        process.exit(0);
      }, 400);
      break;
    case "--color":
      start();
      break;
    default:
      logger.error("Unknown argument: " + startArg);
      process.exit(1);
  }
} else {
  start();
}
