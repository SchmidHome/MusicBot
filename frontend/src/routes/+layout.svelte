<script lang="ts">
  import "../app.sass";
  import currentSong from "$data/currentSong";
</script>

<svelte:head>
  <style lang="sass">

  </style>
</svelte:head>

<div
  class="cover"
  style:background-image={"url(" + $currentSong?.imageUri + ")"}>
</div>
<slot />

<style lang="sass">
  .cover
    position: fixed
    inset: 0
    filter: blur(8px) brightness(0.5)
    background-size: cover
    z-index: -1
</style>