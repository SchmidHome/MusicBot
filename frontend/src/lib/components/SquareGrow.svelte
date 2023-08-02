<script lang="ts">
  let wrapperEle: HTMLDivElement;
</script>

<div
  class="wrapper"
  bind:this={wrapperEle}
  style:flex-direction={!wrapperEle ||
  wrapperEle.clientHeight > wrapperEle.clientWidth
    ? "row"
    : "column"}
>
  <div class="inner">
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style lang="sass">
  .wrapper
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    width: 100%

  .inner
    aspect-ratio: 1
    flex-grow: 1
    position: relative
  
  .content
    position: absolute
    inset: 0
    height: 100%
    width: 100%
</style>
