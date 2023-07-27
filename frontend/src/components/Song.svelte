<script lang="ts">
  import Down from "assets/down.svelte";
  import Heart from "assets/heart.svelte";
  import HeartFilled from "assets/heart_filled.svelte";
  import Same from "assets/same.svelte";
  import ThumbsDown from "assets/thumbs_down.svelte";
  import ThumbsDownFilled from "assets/thumbs_down_filled.svelte";
  import ThumbsUp from "assets/thumbs_up.svelte";
  import ThumbsUpFilled from "assets/thumbs_up_filled.svelte";
  import Up from "assets/up.svelte";
  import portrait from "global/portrait";
  import voteForSong, { getVoteForSong } from "global/vote";
  import { Vote, type Song as SongType } from "../types.d";

  export let song: SongType;

  $: castedVote = getVoteForSong(song);

  $: waitingTimeString =
    song.startDate !== undefined
      ? new Date(song.startDate).toLocaleTimeString("de-DE")
      : "Jetzt";
</script>

<div class="wrapper" class:portrait={$portrait}>
  <div class="text-wrapper">
    <div class="cover" style:background-image={"url(" + song.coverURL + ")"} />
    <div class="info-outer">
      <div class="song-info__left">
        <div class="song-info__left--inner">
          <h2 class="title">{song.name}</h2>
          <span class="artist">{song.artist}</span>
          {#if song.dj}
            <h4 class="added-by">Hinzugefügt von {song.dj}</h4>
          {/if}
        </div>
      </div>

      <div class="song-info__right">
        <div class="play-info">
          <span>{waitingTimeString}</span>
        </div>
        <div class="vote-info">
          {#if song.voteSummary !== null}
            {#if $portrait && import.meta.env.PUBLIC_DISABLE_VOTING !== "true"}
              <div class="vote-buttons">
                <h2>{song.voteSummary}</h2>
                {#each [{ icon: Heart, iconSelected: HeartFilled, vote: Vote.Double }, { icon: ThumbsUp, iconSelected: ThumbsUpFilled, vote: Vote.Up }, { icon: ThumbsDown, iconSelected: ThumbsDownFilled, vote: Vote.Down }] as { icon, iconSelected, vote }}
                  <button
                    class="vote-svg"
                    on:click={() => {
                      voteForSong(song, vote);
                      // update song to trigger recalculation of castedVote
                      song = { ...song };
                    }}
                  >
                    <svelte:component
                      this={castedVote && castedVote.vote === vote
                        ? iconSelected
                        : icon}
                      width="100%"
                      height="100%"
                    />
                  </button>
                {/each}
              </div>
            {:else}
              <h3>{Math.abs(song.voteSummary)}</h3>
              <div class="vote-svg">
                {#if song.voteSummary > 0}
                  <Up width="100%" height="100%" />
                {:else if song.voteSummary < 0}
                  <Down width="100%" height="100%" />
                {:else}
                  <Same width="100%" height="100%" />
                {/if}
              </div>
            {/if}
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
    &.portrait
      min-height: calc(($font-big + $spacing / 2) * 2 + 2 * $font-medium + 2 * $spacing)
  
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
  
  .vote-info
    display: flex
    flex-direction: row
    align-items: center
    justify-content: center
    text-align: center

  .vote-svg
    height: 5vh
    width: 5vh
    color: $text
    background: transparent
    border: none
    outline: none

  .vote-buttons
    display: grid
    grid-template-columns: 1fr 1fr
    align-items: center
    justify-content: center
    button
      height: $font-header
      padding: calc($spacing / 4)

  .right_empty
    height: $font-medium
</style>
