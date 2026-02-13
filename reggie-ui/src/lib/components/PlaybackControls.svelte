<script lang="ts">
  import type { PlaybackState } from "$lib/types";
  import { Pause, Play, Square } from "lucide-svelte";

  interface Props {
    state: PlaybackState;
    hasMessages: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
  }

  let { state, hasMessages, onPlay, onPause, onStop }: Props = $props();
</script>

<div class="flex items-center gap-3">
  {#if state.status === "playing"}
    <button
      onclick={onPause}
      class="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-white hover:bg-amber-600"
      title="Pause (Space)"
    >
      <Pause size={16} />
    </button>
  {:else}
    <button
      onclick={onPlay}
      disabled={!hasMessages}
      class="flex h-8 w-8 items-center justify-center rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
      title="Play (Space)"
    >
      <Play size={16} />
    </button>
  {/if}

  <button
    onclick={onStop}
    disabled={state.status === "idle"}
    class="flex h-8 w-8 items-center justify-center rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
    title="Stop"
  >
    <Square size={16} />
  </button>

  <div class="flex items-center gap-2 text-sm"></div>
</div>
