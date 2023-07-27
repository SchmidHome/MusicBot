<script lang="ts">
  import Music from "../assets/music.svelte";
  import SquareGrow from "./SquareGrow.svelte";

  let wrapperEle: HTMLDivElement;
</script>

<SquareGrow>
  <Music height="100%" width="100%" />
</SquareGrow>
