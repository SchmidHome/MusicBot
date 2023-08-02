<script>
  import Back from "$assets/back.svelte";

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<div class="wrapper">
  <div class="buttons">
    <button class="back-btn" on:click={() => window.history.back()}>
      <Back height="1.25em" width="1.25em" />
    </button>

    <div class="nametag">
      <p>
        {(data.name || data.ip).slice(0, 25)}{(data.name || data.ip).length > 25
          ? "..."
          : ""} ({data.state})
      </p>
    </div>
  </div>

  <div class="content">
    <slot />
  </div>
</div>

<style lang="sass">
  .wrapper
    height: 100vh
    display: flex
    flex-direction: column
    align-items: center

  .buttons
    display: flex
    flex-direction: row
    justify-content: space-between
    width: 100%

  .back-btn
    outline: none
    border: none
    background: $bg-light
    border-bottom-right-radius: $border-radius
    padding: $spacing
    font-size: .8em
    opacity: .8

  .nametag
    background: $bg-light
    border-bottom-left-radius: $border-radius
    padding: $spacing
    font-size: .8em
    opacity: .8

  .content
    flex: 1 1 0
    width: 100%
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    box-sizing: border-box
    padding: $spacing
</style>
