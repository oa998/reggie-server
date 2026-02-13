<script lang="ts">
	import type { PubSubPayload } from '$lib/types';
	import { RotateCcw, Check, AlertCircle } from 'lucide-svelte';

	interface Props {
		payload: PubSubPayload | null;
		onSave: (payload: PubSubPayload) => void;
	}

	let { payload, onSave }: Props = $props();

	let jsonText = $state('');
	let parseError = $state<string | null>(null);
	let originalPayload = $state<PubSubPayload | null>(null);

	$effect(() => {
		if (payload) {
			jsonText = JSON.stringify(payload, null, 2);
			originalPayload = structuredClone(payload);
			parseError = null;
		} else {
			jsonText = '';
			originalPayload = null;
			parseError = null;
		}
	});

	function validateAndParse(): PubSubPayload | null {
		try {
			const parsed = JSON.parse(jsonText);
			if (
				typeof parsed.className !== 'string' ||
				typeof parsed.topic !== 'string' ||
				typeof parsed.attributes !== 'object' ||
				typeof parsed.message !== 'object'
			) {
				parseError = 'Invalid structure: requires className, topic, attributes, and message';
				return null;
			}
			parseError = null;
			return parsed;
		} catch (e) {
			parseError = e instanceof Error ? e.message : 'Invalid JSON';
			return null;
		}
	}

	function handleInput() {
		validateAndParse();
	}

	function handleSave() {
		const parsed = validateAndParse();
		if (parsed) {
			onSave(parsed);
		}
	}

	function handleReset() {
		if (originalPayload) {
			jsonText = JSON.stringify(originalPayload, null, 2);
			parseError = null;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			handleSave();
		}
	}

	const hasChanges = $derived(
		payload && jsonText !== JSON.stringify(payload, null, 2)
	);
</script>

<div class="flex h-full flex-col border-t border-gray-200">
	<div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
		<span class="text-sm font-medium text-gray-700">
			{#if payload}
				Editing: {payload.className}
			{:else}
				JSON Editor
			{/if}
		</span>
		{#if payload}
			<div class="flex items-center gap-2">
				<button
					onclick={handleReset}
					disabled={!hasChanges}
					class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
					title="Reset to original"
				>
					<RotateCcw size={12} />
					Reset
				</button>
				<button
					onclick={handleSave}
					disabled={!!parseError || !hasChanges}
					class="flex items-center gap-1 rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
					title="Save changes (Cmd/Ctrl+S)"
				>
					<Check size={12} />
					Save
				</button>
			</div>
		{/if}
	</div>

	{#if payload}
		<div class="relative flex-1">
			<textarea
				bind:value={jsonText}
				oninput={handleInput}
				onkeydown={handleKeyDown}
				class="h-full w-full resize-none bg-gray-900 p-3 font-mono text-sm text-gray-100 focus:outline-none"
				spellcheck="false"
			></textarea>
			{#if parseError}
				<div
					class="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-red-500/90 px-3 py-2 text-xs text-white"
				>
					<AlertCircle size={14} />
					{parseError}
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-gray-400">
			Select a message to edit its JSON payload
		</div>
	{/if}
</div>
