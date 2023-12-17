<script lang="ts">
  import type { QueueElement, SongElement as SongType } from "../../types.d";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let song: SongType | QueueElement;

  export let hideTime = false;

  $: waitingTimeString =
    song && "playStartTime" in song && song.playStartTime !== undefined
      ? new Date(song.playStartTime ?? Date.now()).toLocaleTimeString("de-DE")
      : "Jetzt";
</script>

<div class="wrapper" on:click={() => {
  dispatch("select");
}} on:keydown={() => {}} tabindex={-1} role="button">
  <div class="text-wrapper">
    <div class="cover" style:background-image={"url(" + song?.imageUri + ")"} />
    <div class="info-outer">
      <div class="song-info__left">
        <div class="song-info__left--inner">
          <h2 class="title">{song?.name}</h2>
          <span class="artist">{song?.artist}</span>
          {#if song && "addedBy" in song && song.addedBy}
            <h4 class="added-by">Hinzugefügt von {song.addedBy}</h4>
          {/if}
        </div>
      </div>

      <div class="song-info__right">
        <slot />
        <div class="play-info">
          {#if !hideTime}
            <span>{waitingTimeString}</span>
          {/if}
        </div>
        <div class="right_empty" />
      </div>
    </div>
  </div>
</div>

<style lang="sass">
  .wrapper
    padding: $spacing
    border-radius: $border-radius
    width: 100%
    background-color: $bg-light
    margin-top: $spacing
    position: relative
    flex: 1 1 0
    box-sizing: border-box
    box-shadow: $shadow
    max-height: 30vh
    height: var(--height, calc(100% - $spacing))
  
  .text-wrapper
    display: flex
    flex-direction: row
    align-items: center
    justify-content: space-between
    height: 100%
  
  .cover
    height: 100%
    aspect-ratio: 1
    background-size: cover
  
  .info-outer
    height: 100%
    flex: 1 1 0
    display: flex    

  .song-info__left
    flex: 1 0 0
    height: 100%
    position: relative

  .song-info__left--inner
    padding: 0 $spacing
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: center
    position: absolute
    top: 0
    left: 0
    box-sizing: border-box
    height: 100%
    width: 100%
  
  .title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 100%
  
  .artist
    color: $text-low
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 100%
  
  .added-by
    color: $text-low
  
  .song-info__right
    display: flex
    flex-direction: column
    align-items: flex-end
    justify-content: space-between
    height: 100%
    position: relative

  .play-info
    line-height: 1
    color: $text-low
    padding-right: calc($spacing / 2)

  .right_empty
    height: $font-medium
</style>
