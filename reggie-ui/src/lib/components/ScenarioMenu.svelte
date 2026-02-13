<script lang="ts">
  import type { Scenario } from "$lib/types";
  import { ClipboardPaste, FolderOpen, Plus, Trash2 } from "lucide-svelte";

  interface Props {
    scenarios: Scenario[];
    currentScenarioId: string | null;
    onNew: () => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onPaste: () => void;
  }

  let { scenarios, currentScenarioId, onNew, onSelect, onDelete, onPaste }: Props = $props();

  let isOpen = $state(false);

  function handleToggle() {
    isOpen = !isOpen;
  }

  function handleNew() {
    onNew();
    isOpen = false;
  }

  function handleSelect(id: string) {
    onSelect(id);
    isOpen = false;
  }

  function handlePaste() {
    onPaste();
    isOpen = false;
  }

  export function close() {
    isOpen = false;
  }
</script>

<div class="relative">
  <button
    onclick={handleToggle}
    class="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
  >
    <FolderOpen size={14} />
    Scenarios
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
    >
      <button
        onclick={handleNew}
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        <Plus size={14} />
        New Scenario
      </button>
      <button
        onclick={handlePaste}
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        <ClipboardPaste size={14} />
        Paste Scenario
      </button>
      <div class="my-1 border-t border-gray-100"></div>
      {#each scenarios as scenario (scenario.id)}
        <div
          class="group flex items-center justify-between px-3 py-2 hover:bg-gray-100"
        >
          <button
            onclick={() => handleSelect(scenario.id)}
            class="flex-1 text-left text-sm
              {scenario.id === currentScenarioId
              ? 'font-medium text-blue-600'
              : 'text-gray-700'}"
          >
            {scenario.name}
            <span class="ml-1 text-xs text-gray-400">
              ({scenario.messages.length})
            </span>
          </button>
          <button
            onclick={() => onDelete(scenario.id)}
            class="rounded p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            title="Delete scenario"
          >
            <Trash2 size={14} />
          </button>
        </div>
      {/each}
    </div>

    <button
      class="fixed inset-0 z-40"
      onclick={() => (isOpen = false)}
      aria-label="Close menu"
    ></button>
  {/if}
</div>
