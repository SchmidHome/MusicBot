<script lang="ts">
  import SquareGrow from "./SquareGrow.svelte";
  import QrCreator from "qr-creator";

  const urlParams = new URLSearchParams(window.location.search);
  const qr = urlParams.get("qr");

  export let link: string = "";
  let wrapper: HTMLDivElement;
  $: src = link || qr || import.meta.env.PUBLIC_DEFAULT_QR_LINK;

  $: if (wrapper)
    QrCreator.render(
      {
        text: src,
        radius: 0.5,
        ecLevel: "H",
        fill: "#ddd",
        background: null,
        size: 1080,
      },
      wrapper
    );
</script>

<SquareGrow>
  <div
    class="wrapper"
    on:click={() => window.open(src, "_blank")}
    bind:this={wrapper}
  />
</SquareGrow>

<style lang="sass">
  .wrapper
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    width: 100%
    padding: calc($spacing / 2)
    box-sizing: border-box
    background-color: $bg-light
    border-radius: $border-radius
    box-shadow: $shadow
    cursor: pointer

  .wrapper :global(canvas)
    height: 100%
    width: 100%
    object-fit: contain

</style>
