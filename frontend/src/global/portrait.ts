import { writable } from "svelte/store";

const portrait = writable<boolean>(false);

function isPortrait() {
  const isPortrait = window.innerHeight > window.innerWidth;
  portrait.set(isPortrait);
  return isPortrait;
}

window.addEventListener("resize", isPortrait);
isPortrait();

export default portrait;
