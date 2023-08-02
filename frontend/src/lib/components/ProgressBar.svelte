<script lang="ts">
  export let percentage: number = 0;
  export let startLabel: string | undefined = undefined;
  export let endLabel: string | undefined = undefined;

</script>

<div class="wrapper">
  <div class="progress-bar">
    <div class="progress-bar__fill" style="width: {percentage}%" />
  </div>
  <div class="lower">
    {#if startLabel}
      <span class="label">{startLabel}</span>
    {/if}
    {#if endLabel}
      <span class="label">{endLabel}</span>
    {/if}
  </div>
</div>

<style lang="sass">
  .wrapper
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
  
  .lower
    display: flex
    align-items: center
    justify-content: space-between
    width: 100%
  
  .label
    padding-top: calc($spacing / 2)
    min-width: fit-content
  
  .label:first-child
    margin-right: 0.5rem
  
  .label:last-child
    margin-left: 0.5rem
  
  .progress-bar
    display: flex
    align-items: center
    justify-content: left
    height: var(--height, 2em)
    width: 100%
    background-color: $bg-dark
    border-radius: $border-radius
    cursor: pointer
  
  .progress-bar__fill
    height: 100%
    background-color: var(--fill, $bg2)
    border-radius: $border-radius

</style>
