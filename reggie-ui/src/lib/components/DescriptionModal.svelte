<script lang="ts">
  import { X } from "lucide-svelte";

  interface Props {
    title: string;
    description: string;
    onSave: (description: string) => void;
    onClose: () => void;
  }

  let { title, description, onSave, onClose }: Props = $props();

  let editedDescription = $state("");

  // Sync with prop when modal opens
  $effect(() => {
    editedDescription = description;
  });

  function handleSave() {
    onSave(editedDescription);
  }

  function handleBackdropClick() {
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  onclick={handleBackdropClick}
>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="w-full max-w-2xl rounded-lg bg-white shadow-xl"
    onclick={(e) => e.stopPropagation()}
    onkeydown={handleKeydown}
  >
    <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <h2 class="text-lg font-medium text-gray-900">
        {title} - Description
      </h2>
      <button
        onclick={onClose}
        class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={20} />
      </button>
    </div>
    <div class="p-4">
      <textarea
        bind:value={editedDescription}
        placeholder="Enter a detailed description of this scenario..."
        class="h-64 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      ></textarea>
    </div>
    <div class="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
      <button
        onclick={onClose}
        class="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
      >
        Cancel
      </button>
      <button
        onclick={handleSave}
        class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        Save
      </button>
    </div>
  </div>
</div>
