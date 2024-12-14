<script lang="ts">
  import "../app.sass";
  import currentSong from "$data/currentSong";
  import { browser } from "$app/environment";
  let lastCoverSave = ""
  let lastSongUri = ""

  setInterval(changeCover, 500)

  function changeCover() {
    if (!browser) return;
    console.log("executing effect, has image",!!$currentSong?.imageUri)
    if (!$currentSong?.imageUri) return;
    if ($currentSong.songUri === lastSongUri) return;
    const lastCover = lastCoverSave;
    lastCoverSave = $currentSong.imageUri;
    lastSongUri = $currentSong.songUri;

    const oldCover = document.getElementById("oldCover")
    const cover = document.getElementById("cover")
    if (!oldCover || !cover) return;

    oldCover.style.transition = "";
    oldCover.style.opacity = "1";
    if (lastCover)
      oldCover.style.backgroundImage = `url(${lastCover})`;

    setTimeout(() => {
      oldCover.style.transition = "opacity 1s ease-in-out";
      cover.style.backgroundImage = `url(${$currentSong!.imageUri})`
      setTimeout(() => {
        oldCover.style.opacity = "0";
      })
    })
  }
  setTimeout(changeCover);
</script>

<svelte:head>
  <style lang="sass">

  </style>
</svelte:head>

<div class="cover" id="cover"></div>
<div class="cover" id="oldCover"></div>

<slot />

<style lang="sass">
  .cover
    position: fixed
    inset: 0
    filter: blur(8px) brightness(0.5)
    background-size: cover
    z-index: -1
</style>
