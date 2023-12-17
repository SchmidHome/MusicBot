import { get, writable } from "svelte/store";
import { connectionError } from "./connectionError";
import type { PlayingElement } from "../types";
import { customFetch } from "./functions";
import { browser } from "$app/environment";

export const globalDelay = writable<
  number
>(0);

export async function refreshDelay(): Promise<number> {
  const delay = await customFetch<{
      delay: number
      }>("delay", {method: "GET"});

  if (delay !== undefined) {
    globalDelay.set(delay.delay);
  }
  return get(globalDelay);
}

// refetch current song every 3 seconds
setInterval(
  refreshDelay,
  import.meta.env.PUBLIC_GLOBAL_DELAY_FETCH_INTERVAL || 3000
);
refreshDelay();

export async function setDelay(delay: number): Promise<void> {
  await customFetch<{
    delay: number
  }>("delay", {method: "POST", body: {delay}});
  globalDelay.set(delay);
}

export default globalDelay;
