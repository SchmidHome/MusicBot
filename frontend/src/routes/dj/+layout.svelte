<script>
  import Back from "$assets/back.svelte";
  import { getUser } from "$data/getUser";
</script>

<div class="wrapper">
  <div class="buttons">
    <button class="back-btn" on:click={() => window.history.back()}>
      <Back height="1.25em" width="1.25em" />
    </button>

    <div class="nametag">
      {#await getUser()}
        <p />
      {:then user}
        <p>
          {user.name.slice(0, 15)}{user.name.length > 15 ? "..." : ""} ({user.state})
        </p>
      {:catch error}
        <p>{error.message}</p>
      {/await}
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
    align-items: center
    width: 100%

  .back-btn
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
