<script lang="ts">
  import queue from "$data/queue";
  import { moveToTop, removeFromQueue } from "$data/queueActions";
  import MainSong from "$lib/components/MainSong.svelte";
  import Song from "$lib/components/Song.svelte";
  import type { QueueElement } from "../../../types";
  
  let openSong: QueueElement | null = null;
  let loading = false;

  async function remove() {
    if (!openSong) return;
    loading = true;
    try {
      const minTime = new Promise((resolve) => setTimeout(resolve, 500));
      await removeFromQueue(openSong);
      await minTime;
      window.location.reload();
    } catch(e) {
      console.error(e);
    } finally {
      loading = false;
      openSong = null;
    }
  }

  async function moveTop() {
    if (!openSong) return;
    loading = true;
    try {
      const minTime = new Promise((resolve) => setTimeout(resolve, 500));
      await moveToTop(openSong);
      await minTime;
      window.location.reload();
    } catch(e) {
      console.error(e);
    } finally {
      loading = false;
      openSong = null;
    }
  }
</script>

{#each $queue as song}
  <div style:height="15vh" style:width="100%">
    <Song {song} on:select={() => openSong = song} />
  </div>
{/each}
<div class="modal" class:open={openSong} on:click={() => {if (!loading) openSong = null}} on:keydown={() => {if (!loading) openSong = null}} tabindex="-1" role="button">
  {#if openSong}
    <div class="innerModal" on:click|stopPropagation on:keydown|stopPropagation role="button" tabindex="-1">
      <MainSong song={openSong} ignoreOrientation omitShadow />
      <div class="divider" />
      {#if loading}
        <p class="loading">Hetzt mich nicht</p>
      {:else}
        <div class="button-wrapper">
          <button class="btn" on:click={moveTop}>Als nächstes</button>
          <button class="btn" on:click={remove}>Löschen</button>
        </div>
      {/if}
    </div>
  {/if}
</div>
<div style:flex-grow="1" />

<style lang="sass">
  .divider
    height: .5rem
    width: calc(100% - 4 * $spacing)
    background: $bg-dark
    margin: $spacing * 2
    box-sizing: border-box

  .button-wrapper
    display: flex
    flex-direction: column
    gap: $spacing
    width: 100%
    align-items: stretch
    padding: $spacing $spacing * 2 $spacing * 2
    box-sizing: border-box
    .btn
      font-size: 1.5em
      font-weight: bold
      border: 1px solid $bg-dark

  .modal
    position: fixed
    top: 0
    left: 0
    height: 100%
    width: 100%
    display: flex
    justify-content: center
    align-items: center
    padding: $spacing
    box-sizing: border-box
    background-color: rgba(0, 0, 0, 0.5)
    &:not(.open)
      display: none

    .innerModal
      background: $bg-light
      width: 90vw
      border-radius: $border-radius
      box-shadow: $shadow
  
  .loading
    text-align: center
    min-height: 5rem
    line-height: 5rem
    font-size: 1.5em
    &::after
      content: ""
      display: inline-block
      animation: dots 1s infinite linear
      min-width: 1.5em
      text-align: left

  @keyframes dots
    0%
      content: ""
    33%
      content: "."
    66%
      content: ".."
    100%
      content: "..."
</style>
