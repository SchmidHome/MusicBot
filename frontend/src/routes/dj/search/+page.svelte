<script lang="ts">
  import { writable } from "svelte/store";
  import { getSongs } from "$data/getSongs";
  import Song from "$lib/components/Song.svelte";
  import { addToQueue } from "$data/queueActions";

  let search = "";

  const debouncedSearch = writable("");
  let timeout: number | null = null;
  $: {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedSearch.set(search);
    }, 500);
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
      <div class="song-wrapper">
        {#each songs as song}
          <Song {song} hideTime --height="25vh">
            <div class="add-btn-wrapper">
              <button
                class="add-btn"
                on:click={() => {
                  addToQueue(song);
                }}>
                +
              </button>
            </div>
          </Song>
        {/each}
      </div>
    {:catch error}
      <p>{error.message}</p>
    {/await}
  {/if}
</div>

<style lang="sass">
  .wrapper
    height: 100vh
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

  .song-wrapper
    display: flex
    flex-direction: column
    flex-grow: 1
    width: 100%
    overflow-y: auto

  .add-btn-wrapper
    display: flex
    height: 100%
    align-items: center
</style>
