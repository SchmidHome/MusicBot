import { get, writable } from "svelte/store";
import { connectionError } from "./connectionError";
import type { PlayingElement } from "../types";
import { customFetch } from "./functions";
import { browser } from "$app/environment";

export const PLACEHOLDER_SONG: PlayingElement & { songPos: number } = {
  _id: "64ca1eafad57bdecbd86063c",
  songUri: "spotify:track:4odiyU3myG29Ld0wurMfE8",
  addedBy: undefined,
  type: "now",
  pos: 0,
  playStartTime: new Date("2023-08-02T09:15:27.038Z"),
  album: "Tomahawk Technique",
  artist: "Sean Paul",
  duration_ms: 227786,
  imageUri: "https://i.scdn.co/image/ab67616d0000b27379e1dc7700b325641537518b",
  name: "She Doesn't Mind",
  paused: true,
  songPos: 0,
};

export const currentSong = writable<
  (PlayingElement & { songPos: number }) | null
>(null);
// automatically increment seconds every 100ms
let secondsInterval: number;
// reset seconds interval
function resetSeconds() {
  if (secondsInterval) clearInterval(secondsInterval);
  secondsInterval = setInterval(() => {
    if (get(currentSong)?.paused) return;
    if (!get(connectionError)) {
      const songValue = get(currentSong) ?? PLACEHOLDER_SONG;
      currentSong.set({
        ...songValue,
        songPos: Math.max(
          Math.min(songValue.songPos + 100, songValue.duration_ms),
          0
        ),
      });
    }
  }, 100);
}

export async function refreshCurrentSong(): Promise<PlayingElement | null> {
  // start seconds interval if not started
  if (!secondsInterval) resetSeconds();
  const song = await customFetch<
    | (Omit<PlayingElement, "playStartTime"> & {
        playStartTime: string | undefined;
      })
    | "nothing playing"
  >("playing");

  if (!song || song === "nothing playing") {
    currentSong.set(null);
    return null;
  }

  const convertedSong: PlayingElement & { songPos: number } = {
    ...song,
    playStartTime: song.playStartTime
      ? new Date(song.playStartTime)
      : undefined,
    songPos: song.playStartTime
      ? Math.min(
          Math.max(Date.now() - new Date(song.playStartTime).getTime(), 0),
          song.duration_ms
        )
      : 0,
  };

  // if seconds are off by more than 1 seconds, reset seconds
  const current = get(currentSong);
  if (current && Math.abs(convertedSong.pos * 1000 - current.pos) > 1000)
    resetSeconds();

  currentSong.set(convertedSong);

  if (browser) window.currentSong = convertedSong;

  return convertedSong;
}

// refetch current song every 3 seconds
setInterval(
  refreshCurrentSong,
  import.meta.env.PUBLIC_CURRENT_SONG_FETCH_INTERVAL || 3000
);
refreshCurrentSong();

export default currentSong;
