<script lang="ts">
	import type { MessageSample } from '$lib/types';
	import { X, AlertCircle, Trash2 } from 'lucide-svelte';

	interface Props {
		sample: MessageSample | null; // null = creating new
		onSave: (sample: MessageSample) => void;
		onDelete?: (messageId: string) => void;
		onClose: () => void;
	}

	let { sample, onSave, onDelete, onClose }: Props = $props();

	const DEFAULT_JSON = `{
  "className": "ExampleMessage",
  "topic": "orders-topic",
  "attributes": {
    "traceId": "123-456-7890"
  },
  "message": {
    "name": "stuff"
  }
}`;

	let jsonText = $state('');
	let parseError = $state<string | null>(null);

	// Initialize form when modal opens
	$effect(() => {
		if (sample) {
			// Edit mode: show sample without messageId
			const { className, topic, attributes, message } = sample;
			jsonText = JSON.stringify({ className, topic, attributes, message }, null, 2);
		} else {
			// Create mode: show default template
			jsonText = DEFAULT_JSON;
		}
		parseError = null;
	});

	function validateAndParse(): Omit<MessageSample, 'messageId'> | null {
		try {
			const parsed = JSON.parse(jsonText);
			if (
				typeof parsed.className !== 'string' ||
				typeof parsed.topic !== 'string' ||
				typeof parsed.attributes !== 'object' ||
				parsed.attributes === null ||
				typeof parsed.message !== 'object' ||
				parsed.message === null
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
			const result: MessageSample = {
				...parsed,
				messageId: sample?.messageId ?? String(Date.now())
			};
			onSave(result);
		}
	}

	function handleBackdropClick() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			handleSave();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
	onclick={handleBackdropClick}
>
	<div
		class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleKeydown}
	>
		<div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
			<div>
				<h2 class="text-lg font-medium text-gray-900">
					{sample ? 'Edit Message Sample' : 'Create Message Sample'}
				</h2>
				{#if sample}
					<p class="text-xs text-gray-500">ID: {sample.messageId}</p>
				{/if}
			</div>
			<button
				onclick={onClose}
				class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
			>
				<X size={20} />
			</button>
		</div>

		<div class="relative flex-1 overflow-hidden">
			<textarea
				bind:value={jsonText}
				oninput={handleInput}
				onkeydown={handleKeydown}
				class="h-96 w-full resize-none bg-gray-900 p-4 font-mono text-sm text-gray-100 focus:outline-none"
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

		<div class="flex gap-2 border-t border-gray-200 px-4 py-3">
			{#if sample && onDelete}
				<button
					onclick={() => onDelete(sample.messageId)}
					class="flex items-center gap-1 rounded px-4 py-2 text-sm text-red-600 hover:bg-red-50"
				>
					<Trash2 size={14} />
					Delete
				</button>
				<div class="flex-1"></div>
			{:else}
				<div class="flex-1"></div>
			{/if}
			<button onclick={onClose} class="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
				Cancel
			</button>
			<button
				onclick={handleSave}
				disabled={!!parseError}
				class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
			>
				Save
			</button>
		</div>
	</div>
</div>
