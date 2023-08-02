import { writable } from "svelte/store";
import type { QueueElement } from "../types";
import { customFetch } from "./functions";
import { browser } from "$app/environment";

export const queue = writable<QueueElement[]>([]);
export async function refreshQueue(): Promise<QueueElement[]> {
  const songs = await customFetch<QueueElement[]>("/queue");
  if (songs) {
    if (browser) window.queue = songs;
    queue.set(songs);
  }

  return songs;
}

// refetch queue every 3 seconds
setInterval(refreshQueue, import.meta.env.PUBLIC_QUEUE_FETCH_INTERVAL || 3000);
refreshQueue();

export default queue;
