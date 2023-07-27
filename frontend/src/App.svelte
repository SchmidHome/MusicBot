<script lang="ts">
  import { connectionError } from "./global/connectionError";
  import Logo from "./components/Logo.svelte";
  import MainSong from "./components/MainSong.svelte";
  import QrCode from "./components/QRCode.svelte";
  import Queue from "./components/Queue.svelte";
  import Time from "./components/Time.svelte";
  import Volume from "./components/Volume.svelte";
  import "./app.sass";
  import Lyrics from "components/Lyrics.svelte";
  import VoteNow from "components/VoteNow.svelte";
  import portrait from "global/portrait";

  const urlParams = new URLSearchParams(window.location.search);
  const lyrics = urlParams.get("lyrics");
  $: showLyrics =
    lyrics === "false" ? false : lyrics === "true" ? true : $portrait;
  const onlyLyrics = urlParams.get("only-lyrics");
</script>

<svelte:head>
  <style lang="sass">

  </style>
</svelte:head>

<main
  class="main"
  class:show-lyrics={!!showLyrics}
  class:only-lyrics={onlyLyrics}
>
  <div class="header">
    <div style:grid-area="logo">
      <div class="absolute">
        <Logo />
      </div>
    </div>
    <div style:grid-area="time" class="time">
      <div class="absolute">
        <Time big={!showLyrics} />
      </div>
    </div>
    <div style:grid-area="qr">
      <div class="absolute">
        <QrCode />
      </div>
    </div>
    {#if $connectionError}
      <div class="error">
        <h3>Connection Error</h3>
        <p>
          Please make sure that the server is running and that the port is
          correct.
        </p>
      </div>
    {/if}
  </div>
  <div class="current">
    <MainSong />
  </div>
  <div
    class="lyrics"
    style:display={onlyLyrics || showLyrics ? undefined : "none"}
  >
    <Lyrics />
  </div>
  <div class="queue">
    <div class="volume">
      <Volume />
    </div>
    <Queue displayedSongs={6} />
  </div>
  <div class="vote">
    <VoteNow />
  </div>
</main>

<style lang="sass">
  .main
    display: grid
    justify-content: center
    align-items: center
    grid-gap: $spacing
    margin: calc($spacing * 1.5)
    width: calc(100% - #{3 * $spacing})
    min-height: calc(100% - #{3 * $spacing})
    
    grid-template-columns: 1fr 20% 1fr
    grid-template-areas: "current header queue"
    grid-template-rows: 1fr
    &.show-lyrics
      @media (orientation: landscape)
        grid-template-columns: 1fr 1fr 1fr
        grid-template-areas: "current header queue" "current lyrics queue"
        grid-template-rows: 33% 1fr
        grid-gap: 0
        grid-column-gap: $spacing
        .header
          grid-template-areas: "logo qr"
          grid-template-columns: 1fr 1fr
          grid-template-rows: 1fr
          height: 100%
          .time
            display: none
    &:not(.show-lyrics)
      @media (orientation: portrait)
        grid-template-areas: "current" "vote" "queue"
        grid-template-columns: 100%
        grid-template-rows: auto auto auto

    &.only-lyrics
      @media (orientation: portrait)
        grid-template-areas: "current" "lyrics"
        grid-template-columns: 100%
        grid-template-rows: auto 1fr
        .current
          margin: $spacing $spacing 0 $spacing
      @media (orientation: landscape)
        grid-template-areas: "current lyrics"
        grid-template-columns: 40% 1fr
        grid-template-rows: 100%
        .current
          padding: calc($spacing * 1.5)
          box-sizing: border-box
      margin: 0
      width: 100%
      height: 100%
      >*:not(.lyrics):not(.current)
        display: none
      .lyrics
        display: block

    >*
      position: relative
      @media (orientation: landscape)
        height: 100%
    @media (orientation: portrait)
      grid-template-areas: "current" "lyrics" "vote" "queue"
      grid-template-columns: 100%
      grid-template-rows: auto 50vh auto auto
      width: calc(100% - #{3 * $spacing})
      min-height: calc(100% - #{2 * $spacing})

  .header
    grid-area: header
    display: grid
    grid-template-columns: auto
    grid-template-rows: 1fr 2fr 2fr
    align-items: center
    max-height: 100%
    grid-gap: $spacing
    @media screen and (orientation: portrait)
      display: none
    @media (orientation: landscape)
      height: 100%
      grid-template-areas: "time" "logo" "qr"
    >*
      position: relative
      height: 100%
      width: 100%

  .absolute
    position: absolute
    inset: 0
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center

  .current
    grid-area: current
    @media (orientation: landscape)
      height: 100%

  .queue
    grid-area: queue
    display: flex
    flex-direction: column
  
  .error
    width: 100%
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    width: calc(100% - #{2 * $spacing})
    background-color: $bg
    color: $error
    border-radius: $border-radius
    text-align: center
    padding: $spacing
    box-sizing: border-box
    margin: 0 $spacing
    h3
      margin-bottom: $spacing

  .lyrics
    grid-area: lyrics
    height: 100%

  .volume
    @media screen and (orientation: portrait)
      display: none
  
  .vote
    grid-area: vote
    @media screen and (orientation: landscape)
      display: none
</style>
