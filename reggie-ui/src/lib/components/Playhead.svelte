<script lang="ts">
  interface Props {
    currentColumn: number;
    columnWidth: number;
    labelWidth: number;
    height: number;
  }

  let { currentColumn, columnWidth, labelWidth, height }: Props = $props();

  // Position at the start of the current column, accounting for label width
  const leftPosition = $derived(labelWidth + (currentColumn - 1) * columnWidth);
</script>

{#if currentColumn > 0}
  <div
    class="pointer-events-none absolute top-0 z-20"
    style="left: {leftPosition}px; width: {columnWidth}px; height: {height}px;"
  >
    <!-- Left edge indicator -->
    <div class="absolute inset-y-0 left-0 w-0.5 bg-red-500"></div>
    <!-- Top marker -->
    <div
      class="absolute -top-1 left-0 h-3 w-3 -translate-x-1/2 rotate-45 bg-red-500"
    ></div>
  </div>
{/if}
