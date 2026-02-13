<script lang="ts">
  import type { MessageResult } from "$lib/types";
  import { X } from "lucide-svelte";

  interface Props {
    result: MessageResult;
    onClose: () => void;
  }

  let { result, onClose }: Props = $props();

  const formattedJson = $derived(
    result.responseBody !== undefined
      ? JSON.stringify(result.responseBody, null, 2)
      : "No response body",
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  onclick={(e) => e.stopPropagation()}
  class="absolute top-full left-0 z-[200] mt-2 w-80 rounded-lg border border-green-200 bg-white p-3 shadow-lg"
>
  <div class="mb-2 flex items-center justify-between">
    <span class="font-medium text-green-600"> Response </span>
    <button
      onclick={onClose}
      class="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    >
      <X size={14} />
    </button>
  </div>
  <div
    class="max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs font-mono text-black whitespace-pre"
  >
    {formattedJson}
  </div>
</div>
