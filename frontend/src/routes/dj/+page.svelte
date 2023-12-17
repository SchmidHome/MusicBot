<script lang="ts">
  import { goto } from "$app/navigation";
  import Search from "$assets/search.svelte";
  import MainSong from "$lib/components/MainSong.svelte";
  import Queue from "$assets/queue.svelte";
  import Microphone from "$assets/microphone.svelte";
  import Delay from "$assets/delay.svelte";

  /** @type {import('./$types').PageData} */
  export let data: any;
</script>

<div style:width="100%">
  <MainSong ignoreOrientation={true} />
</div>
<div class="buttons">
  <button class="search-btn" on:click={() => goto("dj/search")}>
    <Search height="1.5em" width="1.5em" />
  </button>
  <button class="lyrics-btn" on:click={() => goto("dj/lyrics")}>
    <Microphone height="1.5em" width="1.5em" />
  </button>
  <button class="queue-btn" on:click={() => goto("dj/queue")}>
    <Queue height="1.5em" width="1.5em" />
  </button>
  {#if data.state === "admin"}
    <button class="delay-btn" on:click={() => goto("dj/delay")}>
      <Delay height="1.5em" width="1.5em" />
    </button>
  {/if}
</div>

<style lang="sass">
  .buttons
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center
    margin-top: $spacing * 2
    width: 100%

  .search-btn, .queue-btn, .lyrics-btn, .delay-btn
    border-radius: $border-radius
    border: none
    background-color: $bg-light
    padding: $spacing
    display: flex
    justify-content: center
    align-items: center
    font-size: 1.5em
    color: $text-low
    cursor: pointer
    transition: all 0.2s ease-in-out
    box-shadow: $shadow

    &:hover
      background-color: $bg-light
      transform: scale(1.1)
      box-shadow: $shadow

    &:active
      transform: scale(0.9)
      box-shadow: $shadow
</style>
