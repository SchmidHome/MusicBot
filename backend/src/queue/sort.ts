import { getSong } from "../spotify/songCache";
import { getNext, getPlaying, getQueued } from "./getter";
import { setPlayStartTime } from "./setter";

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
