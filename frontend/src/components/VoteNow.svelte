<script lang="ts">
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("vote");

  $: link =
    query ||
    import.meta.env.PUBLIC_VOTE_LINK ||
    import.meta.env.PUBLIC_DEFAULT_QR_LINK;
</script>

<button on:click={() => window.open(link, "_blank")}> → Mitbestimmen ← </button>

<style lang="sass">
  button
    background: $bg2
    border-radius: $border-radius
    padding: calc($spacing * 2)
    box-shadow: $shadow
    margin: $spacing 0
    color: $text
    cursor: pointer
    font-size: 1.5rem
    font-weight: bold
    outline: none
    border: 0
    width: 100%
</style>
