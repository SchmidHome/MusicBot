<script lang="ts">
  import globalDelay, { setDelay } from "$data/delay";
  import Lyrics from "$lib/components/Lyrics.svelte";
  let loading = false;

  async function changeDelay(decrease: boolean) {
    try {
      loading = true;
      await setDelay($globalDelay + (decrease ? -250 : 250));
    } finally {
      loading = false;
    }
  }
</script>

<Lyrics />

<div class="wrapper">
  <h1>
    Global Delay
  </h1>
  <button on:click={changeDelay.bind(undefined, true)} disabled={loading}>Decrease (-250ms)</button>
  <p>Current delay: {$globalDelay}ms</p>
  <button on:click={changeDelay.bind(undefined, false)} disabled={loading}>Increase (+250ms)</button>
</div>
<div style="flex-grow: 1;" />

<style lang="sass">
  .wrapper
    justify-self: flex-start
    display: flex
    flex-direction: row
    align-items: center
    justify-content: center
    position: relative
    background: $bg-light
    padding: $spacing
    gap: $spacing
    opacity: .8
    border-radius: $border-radius

  button
    background: $bg-dark
    box-shadow: $shadow
    border-radius: $border-radius
    border: none
    outline: none
    transition: background 0.3s ease-in-out
    padding: $spacing $spacing * 2
    color: $text
    vertical-align: middle
    &:hover
      background: $bg

  h1
    background: $bg-light
    padding: $spacing * 0.25 $spacing
    position: absolute
    bottom: 100%
</style>