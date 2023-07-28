<script lang="ts">
  import "./app.sass";
  import { urlParams } from "global/urlParams";
  import LyricsPage from "./pages/LyricsPage.svelte";
  import MainPage from "./pages/MainPage.svelte";

  const lyrics = urlParams.get("lyrics");
</script>

<svelte:head>
  <style lang="sass">

  </style>
</svelte:head>

{#if lyrics}
  <LyricsPage />
{:else}
  <MainPage />
{/if}
