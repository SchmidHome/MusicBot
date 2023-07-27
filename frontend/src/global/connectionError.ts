import { writable } from "svelte/store";

export const connectionError = writable(false);

if (import.meta.env.DEV)
  //@ts-ignore
  window.toggleConnectionError = () => {
    connectionError.update((value) => !value);
  };
