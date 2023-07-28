<script lang="ts">
  import Back from "assets/back.svelte";
  import Lyrics from "components/Lyrics.svelte";
  import Song from "components/Song.svelte";
  import currentSong from "global/currentSong";
  import portrait from "global/portrait";
  import queue from "global/queue";
  import { urlParams } from "global/urlParams";

  const lyrics = urlParams.get("lyrics");
</script>

<main class="main" class:lyrics>
  <div class="back">
    <button
      class="back-btn btn"
      on:click={() => {
        window.location.href =
          window.location.origin + window.location.pathname;
      }}
    >
      <Back height=".9em" width=".9em" />
      Zurück
    </button>
  </div>

  {#if !$portrait}
    <div class="currentSong">
      <h1>{$currentSong.name}</h1>
      <h2>{$currentSong.artist}</h2>
    </div>
  {/if}

  <div class="lyrics">
    <Lyrics />
  </div>

  {#if !$portrait && $queue.length}
    <div class="nextSong">
      <span class="nextSong_label">Nächster Song</span>
      <div class="nextSong_song">
        <Song song={$queue[0]} hideTime />
      </div>
    </div>
  {/if}
  <div
    class="background"
    style:background-image={`url(${$currentSong.coverURL})`}
  />
</main>

<style lang="sass">
  .main
    padding: 0 calc($spacing * 2)
    height: 100%
    box-sizing: border-box
    display: grid
    place-items: center
    grid-template-columns: 1fr 3fr 1fr
    position: relative
    gap: $spacing

    @media (orientation: portrait)
      grid-template-columns: 1fr
      grid-template-rows: 1fr
      grid-template-areas: "lyrics"
      padding: 0 $spacing
    

  .back
    position: absolute
    top: $spacing
    left: $spacing
    z-index: 1

    @media (orientation: landscape)
      top: unset
      bottom: calc($spacing * 2)
      left: calc($spacing * 2)

  .currentSong, .nextSong
    margin: calc($spacing * 2) 0
    font-size: .8em
    width: 100%

  .currentSong
    align-self: start
    padding: $spacing
    border-radius: $border-radius
    background-color: $bg-light
    box-sizing: border-box
    box-shadow: $shadow
    h1
      font-size: 1.5em
      margin-bottom: calc($spacing / 2)
    h2
      font-size: 1.25em
      font-weight: normal
      color: $text-low

  .nextSong
    align-self: end

  .nextSong_label
    font-weight: bold
    text-align: right
    width: 100%
    display: block
    margin-bottom: calc($spacing / -2)

  .nextSong_song
    height: 7vw

  .lyrics
    font-size: 1.2em
    position: relative
    height: 100%
    width: 100%

  .background
    position: absolute
    inset: 0
    background-size: cover
    filter: blur(2vh) brightness(30%)
    opacity: .5
    z-index: -1
    pointer-events: none
    background-position: center
</style>
