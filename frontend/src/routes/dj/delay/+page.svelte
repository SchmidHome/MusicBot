<script lang="ts">
  import globalDelay, { setDelay } from "$data/delay";
  let loading = false;

  async function changeDelay(decrease: boolean) {
    try {
      loading = true;
      await setDelay($globalDelay + (decrease ? -500 : 500));
    } finally {
      loading = false;
    }
  }
</script>

<h1>
  Global Delay
</h1>

<p>Current delay: {$globalDelay}</p>

{#if loading}
  <p>Loading...</p>
{:else}
  <button on:click={changeDelay.bind(undefined, true)}>Decrease (-500ms)</button>
  <button on:click={changeDelay.bind(undefined, false)}>Increase (+500ms)</button>
{/if}

<style lang="sass">
  button
    margin-top: $spacing * 2
    background: $bg-dark
    box-shadow: $shadow
    border-radius: $border-radius
    border: none
    outline: none
    transition: background 0.3s ease-in-out
    padding: $spacing $spacing * 2
    color: $text
    &:hover
      background: $bg
</style>