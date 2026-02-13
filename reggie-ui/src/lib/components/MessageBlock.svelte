<script lang="ts">
  import type { MessageResult, ScenarioMessage } from "$lib/types";
  import { X } from "lucide-svelte";
  import ErrorPopover from "./ErrorPopover.svelte";
  import SuccessPopover from "./SuccessPopover.svelte";

  interface Props {
    message: ScenarioMessage;
    columnWidth: number;
    isSelected: boolean;
    isSent: boolean;
    result?: MessageResult;
    onSelect: () => void;
    onDelete: () => void;
    onColumnChange: (newColumn: number) => void;
  }

  let {
    message,
    columnWidth,
    isSelected,
    isSent,
    result,
    onSelect,
    onDelete,
    onColumnChange,
  }: Props = $props();

  const COLORS = [
    "bg-blue-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];

  function getColorForType(className: string): string {
    const hash = className
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLORS[hash % COLORS.length];
  }

  let isDragging = $state(false);
  let dragStartX = $state(0);
  let dragStartColumn = $state(0);
  let showPopover = $state(false);

  function handleDragStart(e: DragEvent) {
    if (!e.dataTransfer) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartColumn = message.column;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", message.id);

    const ghost = document.createElement("div");
    ghost.style.opacity = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => ghost.remove(), 0);
  }

  function handleDrag(e: DragEvent) {
    if (!isDragging || e.clientX === 0) return;
    const deltaX = e.clientX - dragStartX;
    const deltaColumns = Math.round(deltaX / columnWidth);
    const newColumn = Math.min(20, Math.max(1, dragStartColumn + deltaColumns));
    onColumnChange(newColumn);
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function handleDoubleClick() {
    onSelect();
  }

  function handleDeleteClick(e: MouseEvent) {
    e.stopPropagation();
    onDelete();
  }

  function handleStatusClick(e: MouseEvent) {
    e.stopPropagation();
    if (result) {
      showPopover = !showPopover;
    }
  }

  function handleClosePopover() {
    showPopover = false;
  }

  const color = $derived(getColorForType(message.payload.className));
  const leftPosition = $derived((message.column - 1) * columnWidth + 4);
  const blockWidth = $derived(columnWidth - 8);
</script>

<svelte:window
  onclick={() => {
    if (showPopover) showPopover = false;
  }}
/>

<!-- {isSent ? 'opacity-50' : ''} -->
<div
  draggable="true"
  ondragstart={handleDragStart}
  ondrag={handleDrag}
  ondragend={handleDragEnd}
  ondblclick={handleDoubleClick}
  onclick={onSelect}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Enter" && onSelect()}
  class="absolute top-1 flex h-8 cursor-grab items-center gap-1 rounded px-2 text-xs text-white shadow transition-all select-none
    {color}
    {isSelected ? 'ring-2 ring-white ring-offset-2' : ''}
    {isDragging ? 'cursor-grabbing opacity-75' : ''}"
  style="left: {leftPosition}px; width: {blockWidth}px;"
>
  <span class="truncate">{message.payload.className}</span>
  <button
    onclick={handleDeleteClick}
    class="ml-auto shrink-0 rounded p-0.5 hover:bg-white/20"
    title="Delete message"
  >
    <X size={12} />
  </button>

  <!-- Status indicator -->
  {#if result}
    <button
      onclick={handleStatusClick}
      class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full border-2 border-white shadow-sm cursor-pointer
        {result.status === 'success' ? 'bg-green-500' : 'bg-red-500'}"
      title={result.status === "success"
        ? "Click to view response"
        : `Error: ${result.statusCode} ${result.statusText}`}
    ></button>

    {#if showPopover}
      {#if result.status === "error"}
        <ErrorPopover {result} onClose={handleClosePopover} />
      {:else}
        <SuccessPopover {result} onClose={handleClosePopover} />
      {/if}
    {/if}
  {/if}
</div>
