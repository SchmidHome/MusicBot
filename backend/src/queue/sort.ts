import { ObjectId, WithId } from "mongodb";
import { getSong } from "../spotify/songCache";
import { getNext, getPlaying, getQueued, getFullQueue } from "./getter";
import { setPlayStartTime, setPosition } from "./setter";
import { QueueElement } from "./types";
import { Mutex } from "async-mutex";
import { ConsoleLogger } from "../lib/logger";
import { queueLogger } from "./queue";

async function _sortQueue(elements?: WithId<QueueElement>[]) {
  if (!elements) elements = await getFullQueue();

  elements = elements.map((e) => {
    if (e.type === "now") e.pos = 0;
    else if (e.type === "next") e.pos = 0.1;
    else if (typeof e.pos === "number" && e.pos < 1) e.pos = 0.5;
    return e;
  });

  elements = elements.sort((a, b) => {
    if (typeof a.pos === "number" && typeof b.pos === "number") {
      return a.pos - b.pos;
    } else if (typeof a.pos === "number") {
      return -1;
    } else {
      return 1;
    }
  });

  await Promise.all(
    elements.map(async (e, i) => {
      if (e.type === "new") return setPosition(e._id, i, "queued");
      return setPosition(e._id, i);
    })
  );
}

const sortMutex = new Mutex();
export async function sortQueue() {
  return sortMutex.runExclusive(async () => {
    queueLogger.log("sortQueue()");
    await _sortQueue();
  });
}
export async function resortQueue(_id: ObjectId, posChange: number) {
  return sortMutex.runExclusive(async () => {
    queueLogger.log("resortQueue()");
    let elements = await getFullQueue();

    if (posChange > 0) posChange += 0.5;
    if (posChange < 0) posChange -= 0.5;

    const changeElement = elements.find((e) => e._id.equals(_id));
    if (!changeElement || !changeElement.pos) return false;
    changeElement.pos += posChange;

    await _sortQueue(elements);
    return true;
  });
}

export async function updateTime() {
  return sortMutex.runExclusive(async () => {
    const faderTime = 1000 * 12;

    let playing = await getPlaying();
    if (!playing) return;
    if (!playing.playStartTime) return;

    let time =
      playing.playStartTime.getTime() +
      (await getSong(playing.songUri)).duration_ms +
      faderTime / 2;

    let next = await getNext();
    if (next) {
      await setPlayStartTime(next._id, new Date(time - faderTime));
      time += (await getSong(next.songUri)).duration_ms - faderTime;
    }

    let queue = await getQueued();
    for (let element of queue) {
      await setPlayStartTime(element._id, new Date(time - faderTime));
      time += (await getSong(element.songUri)).duration_ms - faderTime;
    }
  });
}
