import { writable } from "svelte/store";
import type { Song } from "../types";
import { customFetch } from "./functions";

export const queue = writable<Song[]>([]);
export async function refreshQueue(): Promise<Song[]> {
  if (import.meta.env.PUBLIC_MOCK_SERVER) {
    const songs: Song[] = [
      {
        name: "This fffire",
        artist: "Franz Ferdinand",
        coverURL:
          "https://i.scdn.co/image/ab67616d00001e0244fadeb140014c49e807c468",
        dj: "",
        songDurationMs: 218000,
        startDate: new Date(Date.now() + 49000),
        voteSummary: Math.round(Math.random() * 10),
      },
      {
        name: "Zukunft Pink (feat. Inéz)",
        artist: "Peter Fox",
        coverURL:
          "https://i.scdn.co/image/ab67616d00001e02c69f53f035bf420d10b47d6f",
        dj: "DJ Fieka",
        songDurationMs: 230000,
        startDate: new Date(Date.now() - 49000 + 218000),
        voteSummary: -3,
      },
      {
        name: "Kann es sein, dass du dumm bist?",
        artist: "Lumpenpack",
        coverURL:
          "https://i.scdn.co/image/ab67616d00001e02f2eef0696e8f8808c76d02d8",
        dj: null,
        songDurationMs: 204000,
        startDate: new Date(Date.now() - 49000 + 218000 + 230000),
        voteSummary: 0,
      },
      {
        name: "Favorite Color Is Blue",
        artist: "Robert DeLong",
        coverURL:
          "https://i.scdn.co/image/ab67616d00001e02aab3ddb0fd66ac1127977d49",
        dj: "DJ Fieka",
        songDurationMs: 214000,
        startDate: new Date(Date.now() - 49000 + 218000 + 230000 + 204000),
        voteSummary: null,
      },
    ]
      .map((_, __, arr) => [...arr])
      .flat();

    window.queue = songs;
    queue.set(songs);
    return songs;
  }
  const songs = await customFetch<Song[]>("/queue");
  if (songs) {
    window.queue = songs;
    queue.set(songs);
  }

  return songs;
}

// refetch queue every 3 seconds
setInterval(refreshQueue, import.meta.env.PUBLIC_QUEUE_FETCH_INTERVAL || 3000);
refreshQueue();

export default queue;
