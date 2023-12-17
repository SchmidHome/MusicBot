<script lang="ts">
  import { writable } from "svelte/store";
  import { getSongs } from "$data/getSongs";
  import Song from "$lib/components/Song.svelte";
  import { addToQueue } from "$data/queueActions";
  import type { SongElement } from "../../../types";
  import MainSong from "$lib/components/MainSong.svelte";

  let search = "";

  const debouncedSearch = writable("");
  let timeout: number | null = null;
  $: {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedSearch.set(search);
    }, 500);
  }

  let openSong: SongElement | null = null;
  let loading = false

  async function add() {
    if (!openSong) return;
    loading = true;
    try {
      const minTime = new Promise((resolve) => setTimeout(resolve, 500));
      await addToQueue(openSong);
      await minTime;
    } catch(e) {
      console.error(e);
    } finally {
      loading = false;
      openSong = null;
    }
  }
</script>

<div class="wrapper">
  <div class="search-wrapper">
    <input bind:value={search} placeholder="Search for a song" />
  </div>

  {#if $debouncedSearch}
    {#await getSongs($debouncedSearch)}
      <p>loading...</p>
    {:then songs}
      <div class="songs-wrapper">
        {#each songs as song}
          <div class="song-wrapper">
            <Song {song} hideTime on:select={() => openSong = song} />
          </div>
        {/each}
      </div>
      <div class="modal" class:open={openSong} on:click={() => {if (!loading) openSong = null}} on:keydown={() => {if (!loading) openSong = null}} tabindex="-1" role="button">
        {#if openSong}
          <div class="innerModal" on:click|stopPropagation on:keydown|stopPropagation role="button" tabindex="-1">
            <MainSong song={openSong} ignoreOrientation omitShadow />
            <div class="divider" />
            {#if loading}
              <p class="loading">Hetzt mich nicht</p>
            {:else}
              <div class="button-wrapper">
                <button class="btn" on:click={add}>Hinzufügen</button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {:catch error}
      <p>{error.message}</p>
    {/await}
  {/if}
</div>

<style lang="sass">
  .wrapper
    height: 100%
    width: 100%
    box-sizing: border-box
    padding: $spacing
    display: flex
    flex-direction: column
    align-items: center

  .search-wrapper
    width: 100%
  .search-wrapper input
    border: 1px solid transparent
    outline: none
    font-size: 1.5em
    background: $bg-light
    border-radius: $border-radius
    padding: $spacing $spacing * 2
    width: 100%
    box-sizing: border-box
    &:focus
      box-shadow: $shadow
      border-color: $bg-dark

  .songs-wrapper
    display: flex
    flex-direction: column
    flex-grow: 1
    width: 100%
    overflow-y: auto
    font-size: .9em

  .song-wrapper
    height: 15vh

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
