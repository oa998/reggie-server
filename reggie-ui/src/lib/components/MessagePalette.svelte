<script lang="ts">
  import { messageSampleStore } from "$lib/stores/messageSample.svelte";
  import type { MessageSample } from "$lib/types";
  import { Package, Plus } from "lucide-svelte";
  import toast from "svelte-french-toast";

  interface Props {
    onEditSample: (sample: MessageSample) => void;
    onCreateSample: () => void;
  }

  let { onEditSample, onCreateSample }: Props = $props();

  let isDragOver = $state(false);

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

  function handleDragStart(e: DragEvent, sample: MessageSample) {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(sample));
    e.dataTransfer.setData("text/plain", sample.className);
  }

  function handleDoubleClick(sample: MessageSample) {
    onEditSample(sample);
  }

  function handleButtonDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    isDragOver = true;
  }

  function handleButtonDragLeave() {
    isDragOver = false;
  }

  async function handleButtonDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      toast.error("Could not read file");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("Invalid JSON");
      return;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      toast.error("JSON must be an object");
      return;
    }

    const obj = parsed as Record<string, unknown>;

    for (const field of ["className", "topic", "attributes", "message"] as const) {
      if (!(field in obj)) {
        toast.error(`Missing required field: ${field}`);
        return;
      }
    }

    if (typeof obj.className !== "string" || typeof obj.topic !== "string") {
      toast.error("className and topic must be strings");
      return;
    }

    if (typeof obj.attributes !== "object" || obj.attributes === null || Array.isArray(obj.attributes)) {
      toast.error("attributes must be an object");
      return;
    }

    if (typeof obj.message !== "object" || obj.message === null || Array.isArray(obj.message)) {
      toast.error("message must be an object");
      return;
    }

    const existing = messageSampleStore.samples.find(
      (s) => s.className === obj.className,
    );

    const sample: MessageSample = {
      messageId: existing?.messageId ?? crypto.randomUUID(),
      className: obj.className as string,
      topic: obj.topic as string,
      attributes: obj.attributes as Record<string, string>,
      message: obj.message as Record<string, unknown>,
    };

    try {
      await messageSampleStore.upsertSample(sample);
      toast.success(
        existing
          ? `${sample.className} was updated`
          : `${sample.className} was created`,
      );
    } catch {
      toast.error("Failed to save message sample");
    }
  }
</script>

<div class="flex h-full flex-col bg-gray-50 p-3">
  <h2 class="mb-3 text-sm font-semibold text-gray-700">Message Templates</h2>

  <button
    onclick={onCreateSample}
    ondragover={handleButtonDragOver}
    ondragleave={handleButtonDragLeave}
    ondrop={handleButtonDrop}
    class="mb-3 flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-colors {isDragOver
      ? 'border-solid border-blue-500 bg-blue-50 text-blue-600'
      : 'border-dashed border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'}"
  >
    <Plus size={16} />
    {isDragOver ? "Drop JSON file here" : "Add Message Type"}
  </button>

  <div class="flex flex-col gap-2">
    {#each messageSampleStore.samples as sample (sample.messageId)}
      {@const color = getColorForType(sample.className)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        draggable="true"
        ondragstart={(e) => handleDragStart(e, sample)}
        ondblclick={() => handleDoubleClick(sample)}
        class="flex cursor-grab items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
        title={sample.className}
      >
        <div
          class="{color} flex h-8 w-8 items-center justify-center rounded text-white"
        >
          <Package size={16} />
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-gray-900">
            {sample.className}
          </div>
          <div class="truncate text-xs text-gray-500">
            {sample.topic}
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if messageSampleStore.isLoading}
    <div class="py-4 text-center text-sm text-gray-400">
      Loading templates...
    </div>
  {:else if messageSampleStore.error}
    <div class="py-4 text-center text-sm text-red-500">
      {messageSampleStore.error}
    </div>
  {:else if messageSampleStore.samples.length === 0}
    <div class="py-4 text-center text-sm text-gray-400">
      No message templates yet.<br />Click "Add Message Type" to create one.
    </div>
  {/if}
</div>
