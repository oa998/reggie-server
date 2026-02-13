<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    minHeight?: number;
    maxHeightRatio?: number;
    initialHeightRatio?: number;
    children: Snippet;
  }

  let {
    minHeight = 128,
    maxHeightRatio = 0.8,
    initialHeightRatio = 0.5,
    children,
  }: Props = $props();

  let height = $state(0);
  let isResizing = $state(false);
  let initialized = $state(false);

  $effect(() => {
    if (!initialized && typeof window !== "undefined") {
      height = window.innerHeight * initialHeightRatio;
      initialized = true;
    }
  });

  function handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    const startY = e.clientY;
    const startHeight = height;

    function onMouseMove(e: MouseEvent) {
      const deltaY = startY - e.clientY;
      const maxHeight = window.innerHeight * maxHeightRatio;
      height = Math.min(maxHeight, Math.max(minHeight, startHeight + deltaY));
    }

    function onMouseUp() {
      isResizing = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  export function getIsResizing() {
    return isResizing;
  }
</script>

<div class="flex-shrink-0" style="height: {height}px;">
  <!-- Resize handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onmousedown={handleResizeStart}
    class="h-1.5 cursor-ns-resize border-t border-gray-200 bg-gray-100 hover:bg-blue-200 transition-colors
      {isResizing ? 'bg-blue-300' : ''}"
  ></div>
  <div class="h-[calc(100%-6px)]">
    {@render children()}
  </div>
</div>
