import { writable } from "svelte/store";

export const connectionError = writable(false);

if (import.meta.env.DEV)
  window.toggleConnectionError = () => {
    connectionError.update((value) => !value);
  };
