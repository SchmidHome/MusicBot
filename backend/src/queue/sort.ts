import { getSong } from "../spotify/songCache";
import { getNew, getNext, getPlaying, getQueued } from "./getter";
import { setPlayStartTime, setPosition } from "./setter";

export async function sortQueue() {
  let next = await getNext();
  let elements = [...(await getQueued()), ...(await getNew())];
  let startPos = next ? 1 : 0;

  elements = elements.sort((a, b) => {
    if (typeof a.pos === "number" && typeof b.pos === "number") {
      return a.pos - b.pos;
    } else if (typeof a.pos === "number") {
      return -1;
    } else {
      return 1;
    }
  });

  await Promise.all(elements.map((e, i) => setPosition(e._id, startPos + i)));
}

export async function updateTime() {
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
}
