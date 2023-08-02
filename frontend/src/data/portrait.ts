import { onMount } from "svelte";
import { writable } from "svelte/store";

function usePortrait() {
  let portrait = writable(false);
  onMount(() => {
    portrait.set(window.matchMedia("(orientation: portrait)").matches);
    window.addEventListener("resize", () => {
      portrait.set(window.matchMedia("(orientation: portrait)").matches);
    });
  });
  return portrait;
}

export default usePortrait;
