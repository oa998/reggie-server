<script lang="ts">
  import { User, UserPlus } from "lucide-svelte";

  interface Props {
    users: string[];
    currentUserId: string | null;
    onSelect: (userId: string) => void;
    onAdd: (userId: string) => void;
  }

  let { users, currentUserId, onSelect, onAdd }: Props = $props();

  let isOpen = $state(false);
  let newUserId = $state("");

  function handleToggle() {
    isOpen = !isOpen;
  }

  function handleSelect(userId: string) {
    onSelect(userId);
    isOpen = false;
  }

  function handleAdd() {
    const trimmed = newUserId.trim();
    if (trimmed && !users.includes(trimmed)) {
      onAdd(trimmed);
      newUserId = "";
      isOpen = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleAdd();
    }
  }

  export function close() {
    isOpen = false;
  }
</script>

<div class="relative">
  <button
    onclick={handleToggle}
    class="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
  >
    <User size={14} />
    {currentUserId ?? "Select User"}
  </button>

  {#if isOpen}
    <div
      class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
    >
      <div class="px-3 py-2">
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={newUserId}
            onkeydown={handleKeyDown}
            placeholder="New user ID..."
            class="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onclick={handleAdd}
            disabled={!newUserId.trim() || users.includes(newUserId.trim())}
            class="flex items-center gap-1 rounded bg-blue-500 px-2 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <UserPlus size={14} />
          </button>
        </div>
      </div>

      {#if users.length > 0}
        <div class="my-1 border-t border-gray-100"></div>
        {#each users as userId (userId)}
          <button
            onclick={() => handleSelect(userId)}
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100
              {userId === currentUserId ? 'font-medium text-blue-600' : 'text-gray-700'}"
          >
            <User size={14} />
            {userId}
          </button>
        {/each}
      {/if}
    </div>

    <button
      class="fixed inset-0 z-40"
      onclick={() => (isOpen = false)}
      aria-label="Close menu"
    ></button>
  {/if}
</div>
