<script>
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import Back from "$assets/back.svelte";

  /** @type {import('./$types').PageData} */
  export let data;
  let name = browser ? data.name || data.ip || "" : "";
</script>

<div class="wrapper">
  <div class="buttons">
    <button class="back-btn" on:click={() => goto("/dj")}>
      <Back height="1.25em" width="1.25em" />
    </button>

    <div class="nametag">
      <p>
        {name.slice(0, 28)}{name.length > 25 ? "..." : ""} ({data.state})
      </p>
    </div>
  </div>

  <div class="content">
    <slot />
  </div>
</div>

<style lang="sass">
  .wrapper
    height: 100%
    min-height: 90vh
    display: flex
    flex-direction: column
    align-items: center

  .buttons
    display: flex
    flex-direction: row
    justify-content: space-between
    width: 100%
    position: relative
    z-index: 100

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
