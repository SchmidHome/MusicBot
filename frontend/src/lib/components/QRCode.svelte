<script lang="ts">
  import { onMount } from "svelte";
  import SquareGrow from "./SquareGrow.svelte";
  import { browser } from "$app/environment";

  let QrCreator: any | null = null;
  onMount(async () => {
    QrCreator = (await import("qr-creator")).default;
  });

  const urlParams = new URLSearchParams(browser ? window.location.search : "");
  const qr = urlParams.get("qr");

  export let link: string = "";
  let wrapper: HTMLButtonElement;
  $: src =
    link || qr || import.meta.env.PUBLIC_DEFAULT_QR_LINK || browser
      ? window.location.href + "dj"
      : "";

  $: if (wrapper)
    QrCreator?.render(
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
  <button
    class="wrapper"
    on:click={() => window.open(src, "_self")}
    on:keydown={() => window.open(src, "_self")}
    bind:this={wrapper} />
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
    outline: none
    border: none

  .wrapper :global(canvas)
    height: 100%
    width: 100%
    object-fit: contain

</style>
