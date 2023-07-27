<script lang="ts">
  import { onMount } from "svelte";
  import portrait from "global/portrait";

  export let big: boolean = false;

  let time = new Date();

  onMount(() => {
    let setNow;
    function setNowInterval() {
      if (setNow) clearInterval(setNow);
      setNow = setInterval(() => {
        time = new Date();
      }, 1000);
    }
    setNowInterval();
  });
</script>

<div class="wrapper">
  <h2 class:big>
    {time.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: $portrait ? undefined : "2-digit",
    })}
  </h2>
</div>

<style lang="sass">
  .wrapper
    width: 100%
    padding: calc($spacing / 4)
    text-align: center
    box-sizing: border-box
  
  h2
    font-size: $font-header * 1.125
    color: $text
    margin: 0
    &.big
      font-size: $font-header * 1.5

</style>
