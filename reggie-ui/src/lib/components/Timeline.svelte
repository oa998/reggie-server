<script lang="ts">
  import type {
    MessageResult,
    PubSubPayload,
    ScenarioMessage,
  } from "$lib/types";
  import MessageBlock from "./MessageBlock.svelte";
  import Playhead from "./Playhead.svelte";

  interface Props {
    messages: ScenarioMessage[];
    selectedMessageId: string | null;
    currentColumn: number;
    completedColumns: number;
    isPlaying: boolean;
    messageResults: Record<string, MessageResult>;
    onAddMessage: (payload: PubSubPayload, column: number) => void;
    onSelectMessage: (id: string | null) => void;
    onDeleteMessage: (id: string) => void;
    onUpdateColumn: (id: string, column: number) => void;
  }

  let {
    messages,
    selectedMessageId,
    currentColumn,
    completedColumns,
    isPlaying,
    messageResults,
    onAddMessage,
    onSelectMessage,
    onDeleteMessage,
    onUpdateColumn,
  }: Props = $props();

  const COLUMN_WIDTH = 132;
  const LABEL_WIDTH = 240;
  const TOTAL_COLUMNS = 20;

  let timelineElement: HTMLDivElement | undefined = $state();
  let isDragOver = $state(false);

  const lanes = $derived.by(() => {
    const grouped: Record<string, ScenarioMessage[]> = {};
    for (const msg of messages) {
      const className = msg.payload.className;
      if (!grouped[className]) {
        grouped[className] = [];
      }
      grouped[className].push(msg);
    }
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  });

  const columnHeaders = $derived(
    Array.from({ length: TOTAL_COLUMNS }, (_, i) => i + 1),
  );

  const timelineWidth = $derived(TOTAL_COLUMNS * COLUMN_WIDTH);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    if (!e.dataTransfer || !timelineElement) return;

    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;

    try {
      const payload: PubSubPayload = JSON.parse(jsonData);
      const rect = timelineElement.getBoundingClientRect();
      const scrollLeft = timelineElement.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      // Calculate column from drop position (account for label width)
      const columnX = x - LABEL_WIDTH;
      const column = Math.min(
        TOTAL_COLUMNS,
        Math.max(1, Math.ceil(columnX / COLUMN_WIDTH)),
      );
      onAddMessage(payload, column);
    } catch {
      console.error("Failed to parse dropped data");
    }
  }

  function handleTimelineClick(e: MouseEvent) {
    if (
      e.target === timelineElement ||
      (e.target as HTMLElement).classList.contains("lane") ||
      (e.target as HTMLElement).classList.contains("lane-content")
    ) {
      onSelectMessage(null);
    }
  }

  function isSent(messageId: string): boolean {
    const msg = messages.find((m) => m.id === messageId);
    return msg ? msg.column <= completedColumns : false;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="flex h-full flex-col">
  <div
    class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2"
  >
    <span class="text-sm font-medium text-gray-700">Timeline</span>
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    bind:this={timelineElement}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={handleTimelineClick}
    role="application"
    tabindex="0"
    class="relative flex-1 overflow-auto bg-white
			{isDragOver ? 'bg-blue-50' : ''}"
  >
    <div
      class="relative"
      style="width: {LABEL_WIDTH + timelineWidth}px; min-height: 100%;"
    >
      <!-- Column headers -->
      <div
        class="sticky top-0 z-10 flex h-6 border-b border-gray-200 bg-gray-100"
      >
        <!-- Empty space for label column -->
        <div
          class="shrink-0 border-r border-gray-200"
          style="width: {LABEL_WIDTH}px;"
        ></div>
        <!-- Column numbers -->
        {#each columnHeaders as colNum (colNum)}
          <div
            class="flex shrink-0 items-center justify-center border-r border-gray-200 text-xs font-medium text-gray-500"
            style="width: {COLUMN_WIDTH}px;"
          >
            {colNum}
          </div>
        {/each}
      </div>

      <div class="relative">
        {#if lanes.length === 0}
          <div
            class="flex h-32 items-center justify-center text-sm text-gray-400"
            style="width: {LABEL_WIDTH + timelineWidth}px;"
          >
            Drag messages here to build your scenario
          </div>
        {:else}
          {#each lanes as [className, laneMessages], i (className)}
            <div
              class="lane relative flex h-10 border-b border-gray-100"
              class:bg-gray-50={i % 2 === 1}
            >
              <!-- Fixed label column -->
              <div
                class="sticky left-0 z-5 flex h-full shrink-0 items-center bg-white/90 px-2 text-xs font-medium text-gray-600 border-r border-gray-200"
                style="width: {LABEL_WIDTH}px;"
              >
                <span class="truncate">{className}</span>
              </div>
              <!-- Draggable content area -->
              <div
                class="lane-content relative"
                style="width: {timelineWidth}px;"
              >
                {#each laneMessages as message (message.id)}
                  <MessageBlock
                    {message}
                    columnWidth={COLUMN_WIDTH}
                    isSelected={selectedMessageId === message.id}
                    isSent={isSent(message.id)}
                    result={messageResults[message.id]}
                    onSelect={() => onSelectMessage(message.id)}
                    onDelete={() => onDeleteMessage(message.id)}
                    onColumnChange={(column) =>
                      onUpdateColumn(message.id, column)}
                  />
                {/each}
              </div>
            </div>
          {/each}
        {/if}

        {#if isPlaying || currentColumn > 0}
          <Playhead
            {currentColumn}
            columnWidth={COLUMN_WIDTH}
            labelWidth={LABEL_WIDTH}
            height={lanes.length * 40 + 24}
          />
        {/if}
      </div>
    </div>
  </div>
</div>
