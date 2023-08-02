<script lang="ts">
  import Logo from "$lib/components/Logo.svelte";
  import Time from "$lib/components/Time.svelte";
  import QrCode from "$lib/components/QRCode.svelte";
  import MainSong from "$lib/components/MainSong.svelte";
  import Queue from "$lib/components/Queue.svelte";
  import Volume from "$lib/components/Volume.svelte";
  import { connectionError } from "$data/connectionError";
  import { goto } from "$app/navigation";
</script>

<main class="main">
  <div class="header">
    <div style:grid-area="logo">
      <div class="absolute">
        <Logo />
      </div>
    </div>
    <div style:grid-area="time" class="time">
      <div class="absolute">
        <Time big />
      </div>
    </div>
    <div style:grid-area="qr">
      <div class="absolute">
        <QrCode />
      </div>
    </div>
    <div style:grid-area="lyrics">
      <button
        class="lyrics-btn btn"
        on:click={() => {
          goto("/lyrics");
        }}>
        Lyrics
      </button>
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
  <div class="queue">
    <div class="volume">
      <Volume />
    </div>
    <Queue displayedSongs={6} />
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
    height: calc(100% - #{3 * $spacing})
    
    grid-template-columns: 1fr 20% 1fr
    grid-template-areas: "current header queue"
    grid-template-rows: 1fr

    >*
      position: relative
      height: 100%

  .header
    grid-area: header
    display: grid
    grid-template-columns: auto
    grid-template-rows: 1fr 2fr 2fr auto
    align-items: center
    max-height: 100%
    grid-gap: $spacing
    height: 100%
    grid-template-areas: "time" "logo" "qr" "lyrics"
    >*
      position: relative
      height: 100%
      width: 100%

  .lyrics-btn
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
    height: 100%

  .queue
    grid-area: queue
    display: flex
    flex-direction: column

  .volume
    margin-bottom: $spacing
  
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
</style>
