import type { CurrentSong, Lyrics, Song } from "./types";

declare global {
  interface Window {
    toggleConnectionError: () => void;
    queue: Song[];
    volume: number;
    lyrics: Lyrics;
    currentSong: CurrentSong;
  }
}

export {};
