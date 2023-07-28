import { get, writable } from "svelte/store";
import { connectionError } from "./connectionError";
import type { CurrentSong } from "../types";
import { customFetch } from "./functions";

export const PLACEHOLDER_SONG = {
  name: "No song playing",
  artist: "-",
  coverURL: "such-empty.jpg",
  dj: "",
  positionInTrack: 0,
  songDurationMs: 0,
  startDate: new Date(),
  voteSummary: 0,
};

export const currentSong = writable<CurrentSong | null>(null);
// automatically increment seconds every 100ms
let secondsInterval: number;
// reset seconds interval
function resetSeconds() {
  if (secondsInterval) clearInterval(secondsInterval);
  secondsInterval = setInterval(() => {
    if (!get(connectionError)) {
      const songValue = get(currentSong) ?? PLACEHOLDER_SONG;
      currentSong.set({
        ...songValue,
        positionInTrack: Math.max(
          Math.min(songValue.positionInTrack + 100, songValue.songDurationMs),
          0
        ),
      });
    }
  }, 100);
}

export async function refreshCurrentSong(): Promise<CurrentSong | null> {
  // start seconds interval if not started
  if (!secondsInterval) resetSeconds();
  if (import.meta.env.PUBLIC_MOCK_SERVER) {
    const song: CurrentSong = {
      name: "Chabos wissen, wer der Babo ist (Swing / Jazz Version)",
      artist: "Marti Fischer",
      coverURL:
        "https://i.scdn.co/image/ab67616d00001e02e06457bcad9e375ba856a11c",
      dj: "DJ Fieka",
      positionInTrack:
        (get(currentSong) ?? PLACEHOLDER_SONG).positionInTrack >= 215870
          ? 0
          : (get(currentSong) ?? PLACEHOLDER_SONG).positionInTrack,
      songDurationMs: 215870,
      startDate: new Date(Date.now() - 52000),
      voteSummary: 3,
    };
    currentSong.set(song);

    window.currentSong = song;

    return song;
  } else {
    const song = await customFetch<
      | (Omit<CurrentSong, "positionInTrack" | "startDate"> & {
          startDate: string;
        })
      | "nothing playing"
    >("playing");

    if (!song || song === "nothing playing") {
      currentSong.set(null);
      return null;
    }

    const convertedSong: CurrentSong = {
      ...song,
      startDate: new Date(song.startDate),
      positionInTrack: Math.min(
        Math.max(Date.now() - new Date(song.startDate).getTime(), 0),
        song.songDurationMs
      ),
    };

    // if seconds are off by more than 1 seconds, reset seconds
    if (
      Math.abs(
        convertedSong.positionInTrack * 1000 - get(currentSong).positionInTrack
      ) > 1000
    )
      resetSeconds();

    currentSong.set(convertedSong);

    window.currentSong = convertedSong;

    return convertedSong;
  }
}

// refetch current song every 3 seconds
setInterval(
  refreshCurrentSong,
  import.meta.env.PUBLIC_CURRENT_SONG_FETCH_INTERVAL || 3000
);
refreshCurrentSong();

export default currentSong;
