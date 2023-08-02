<script lang="ts">
  import ProgressBar from "./ProgressBar.svelte";
  import { getTimeStringFromMS } from "$data/functions";
  import currentSong from "$data/currentSong";

  $: durationString = $currentSong
    ? getTimeStringFromMS($currentSong.duration_ms)
    : "";

  $: positionInTrackString = $currentSong
    ? getTimeStringFromMS($currentSong.songPos)
    : "";

  $: songPercentage =
    (($currentSong?.songPos ?? 0) / ($currentSong?.duration_ms ?? 1)) * 100;
</script>

<div class="wrapper">
  <div
    class="cover"
    style:background-image={"url(" + $currentSong?.imageUri + ")"} />

  <div class="lower-wrapper">
    <div class="title-wrapper">
      <h1 class="title">{$currentSong?.name}</h1>
    </div>
    <div class="subtitle">
      <span class="artist">{$currentSong?.artist}</span>
      {#if $currentSong?.addedBy}
        <span class="added-by">Hinzugefügt von {$currentSong.addedBy}</span>
      {/if}
    </div>

    <ProgressBar
      percentage={songPercentage}
      startLabel={positionInTrackString}
      endLabel={durationString}
      --height=".5em"
      --fill="var(--text-low)" />
  </div>
</div>

<style lang="sass">
  .wrapper
    display: flex
    width: 100%
    height: 100%
    padding: calc($spacing * 1.5)
    border-radius: $border-radius
    background-color: $bg-light
    box-sizing: border-box
    box-shadow: $shadow
    flex-direction: column
    @media screen and (orientation: portrait)
      flex-direction: row
  
  .lower-wrapper
    display: flex
    flex-direction: column
    justify-content: center
    flex-grow: 1
    width: 100%
    @media screen and (orientation: landscape)
      margin-top: $spacing
  
  .cover
    aspect-ratio: 1
    background-size: cover
    box-shadow: $shadow
    width: 100%
    @media screen and (orientation: portrait)
      width: 45%
      height: 45%
      margin: auto $spacing auto 0

  .title-wrapper
    margin: 0
    width: 100%
    position: relative
    height: 3rem
    @media screen and (orientation: portrait)
      height: 2rem

  .title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    position: absolute
    inset: 0
    width: 100%
    @media screen and (orientation: portrait)
      font-size: 1.5em
  
  .subtitle
    display: flex
    font-weight: bold
    color: $text-low
    margin-bottom: $spacing
    @media screen and (orientation: portrait)
      flex-direction: column
  
  .artist
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    @media screen and (orientation: landscape)
      flex: 1 1 0
  
  .artist:not(:last-child)
    margin-right: $spacing
</style>
