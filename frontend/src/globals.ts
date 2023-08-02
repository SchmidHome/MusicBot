import type { PlayingElement, Lyrics, QueueElement } from "./types";

declare global {
  interface Window {
    toggleConnectionError: () => void;
    queue: QueueElement[];
    volume: number;
    lyrics: Lyrics;
    currentSong: PlayingElement;
  }
}

export {};
