<script>
  import queue from "$data/queue";
  import { removeFromQueue } from "$data/queueActions";
  import Song from "$lib/components/Song.svelte";
</script>

{#each $queue as song}
  <div style:height="15vh" style:width="100%">
    <Song {song}>
      <div class="btn-wrapper">
        <button
          class="delete-btn"
          on:click={() =>
            removeFromQueue(song).then(() => window.location.reload())}>
          x
        </button>
      </div>
    </Song>
  </div>
{/each}
<div style:flex-grow="1" />

<style lang="sass">
  .delete-btn
    font-size: 2em
    font-weight: bold
</style>
