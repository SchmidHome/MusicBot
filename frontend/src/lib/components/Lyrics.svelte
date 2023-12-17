<script lang="ts">
  import lyrics from "$data/lyrics";
  import currentSong from "$data/currentSong";
  import type { SyncedLyrics, UnsyncedLyrics } from "../../types.d";
  import globalDelay from "$data/delay";

  let currentLineEle: HTMLElement | null = null;

  $: currentIndex = (() => {
    if ($lyrics.error) return -1;
    let currentLyrics = $lyrics as SyncedLyrics | UnsyncedLyrics;
    if (currentLyrics.syncType === "LINE_SYNCED") {
      let index = currentLyrics.lines.findIndex(
        (line) => line.startTimeMs + $globalDelay >= ($currentSong?.songPos ?? 0)
      );
      if (index === 0) return -1;
      if (index === -1) return currentLyrics.lines.length;
      return index - 1;
    } else if (currentLyrics.syncType === "UNSYNCED") {
      const songPercentage = $currentSong
        ? $currentSong.songPos / $currentSong.duration_ms
        : 0;
      const lyricsPercentage = currentLyrics.lines.length * songPercentage;
      return Math.floor(lyricsPercentage);
    }
  })();

  let wrapper: HTMLDivElement;

  $: if (currentLineEle && !$lyrics.error && wrapper) {
    wrapper.scrollTop = currentLineEle.offsetTop - wrapper.offsetHeight / 2;
  } else if (currentIndex === -1 && wrapper) {
    wrapper.scrollTop = 0;
  }
  // currentLineEle.scrollIntoView({
  //   behavior: "smooth",
  //   block: "center",
  //   inline: "center",
  // });
</script>

<div class="wrapper">
  <div class="lyrics" bind:this={wrapper}>
    <div class="padding_element" />
    {#if $lyrics.error}
      <div class="no-lyrics">
        <p>No Lyrics</p>
      </div>
    {:else}
      {#each $lyrics.lines as line, index}
        {#if index === currentIndex}
          <!-- dont highligh current when not synced -->
          <p
            class:current={$lyrics.syncType === "LINE_SYNCED"}
            bind:this={currentLineEle}>
            {line.words}
          </p>
        {:else}
          <p>{line.words}</p>
        {/if}
      {/each}
    {/if}
    <div class="padding_element" />
  </div>
</div>

<style lang="sass">
  .wrapper
    border-radius: $border-radius
    box-sizing: border-box
    display: flex
    flex-direction: column
    align-items: center
    height: 100%
    width: 100%
    position: absolute
    top: 0
    left: 0
    overflow: auto
    pointer-events: none
    &::-webkit-scrollbar
      width: 0

  .lyrics
    position: absolute
    inset: 0
    overflow: hidden
    scroll-behavior: smooth
    pointer-events: none
          
  p
    text-align: center
    margin: calc($spacing / 2) 0
    word-break: break-word
    max-width: 100%
    font-size: 1.75em
    transition: color 1s, margin 1s
    // &.current~ p
    color: $text-low
    &.current
      color: $text
      margin: calc($spacing * 2) 0

  .padding_element
    height: 100%
    width: 100%

  .no-lyrics
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    p
      font-size: 1.75em
      color: $text-low
      text-align: center
      margin: 0
</style>
