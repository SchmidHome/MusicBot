import { writable } from "svelte/store";
import type { Lyrics, LyricsElement, PlayingElement } from "../types";
import currentSong from "./currentSong";
import { customFetch } from "./functions";
import { browser } from "$app/environment";

export const lyrics = writable<Lyrics>({
  error: true,
  syncType: "NO_SONG",
  lines: [],
});

export async function refreshLyrics(): Promise<Lyrics> {
  const newLyrics = await customFetch<LyricsElement>("lyrics");

  if (!newLyrics) {
    const errorLyrics: Lyrics = {
      error: true,
      syncType: "NO_SONG",
      lines: [],
    };
    lyrics.set(errorLyrics);
    return errorLyrics;
  }

  if (newLyrics.lyrics.error === false)
    // convert string from api to number
    for (const lyric of newLyrics.lyrics.lines)
      lyric.startTimeMs = Number(lyric.startTimeMs);
  else {
    // fill out fields to prevent errors
    newLyrics.lyrics.syncType = "NO_LYRICS";
    newLyrics.lyrics.lines = [];
  }

  lyrics.set(newLyrics.lyrics);

  if (browser) window.lyrics = newLyrics.lyrics;

  return newLyrics.lyrics;
}

// refresh lyrics instantly when song changes
let lastSongName = "";
currentSong.subscribe((song) => {
  if (song && song.name !== lastSongName) {
    refreshLyrics();
    lastSongName = song.name;
  }
});

// refresh lyrics every 20 seconds
setInterval(
  refreshLyrics,
  import.meta.env.VITE_REFRESH_LYRICS_INTERVAL || 20 * 1000
);

export default lyrics;
