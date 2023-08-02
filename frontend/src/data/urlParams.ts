import { browser } from "$app/environment";

export const urlParams = new URLSearchParams(
  browser ? window.location.search : ""
);
