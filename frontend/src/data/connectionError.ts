import { browser } from "$app/environment";
import { writable } from "svelte/store";

export const connectionError = writable(false);

if (import.meta.env.DEV && browser)
  window.toggleConnectionError = () => {
    connectionError.update((value) => !value);
  };
