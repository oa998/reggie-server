<script lang="ts">
  import DescriptionModal from "$lib/components/DescriptionModal.svelte";
  import JsonEditor from "$lib/components/JsonEditor.svelte";
  import MessagePalette from "$lib/components/MessagePalette.svelte";
  import MessageSampleModal from "$lib/components/MessageSampleModal.svelte";
  import PlaybackControls from "$lib/components/PlaybackControls.svelte";
  import ResizablePanel from "$lib/components/ResizablePanel.svelte";
  import ScenarioMenu from "$lib/components/ScenarioMenu.svelte";
  import Timeline from "$lib/components/Timeline.svelte";
  import UserMenu from "$lib/components/UserMenu.svelte";
  import { messageSampleStore } from "$lib/stores/messageSample.svelte";
  import { playbackStore } from "$lib/stores/playback.svelte";
  import { scenarioStore } from "$lib/stores/scenario.svelte";
  import { userStore } from "$lib/stores/user.svelte";
  import type { MessageSample, PubSubPayload, Scenario } from "$lib/types";
  import { Check, ClipboardPaste, Copy, FileText, Pen, Trash2, X } from "lucide-svelte";
  import { toast, Toaster } from "svelte-french-toast";

  let isEditingName = $state(false);
  let editedName = $state("");
  let showDescriptionModal = $state(false);
  let showMessageSampleModal = $state(false);
  let editingMessageSample = $state<MessageSample | null>(null);

  // Sync user selection with scenario loading
  $effect(() => {
    if (userStore.currentUserId) {
      scenarioStore.loadForUser(userStore.currentUserId);
    } else {
      scenarioStore.clearForNoUser();
    }
  });

  // User handlers
  function handleSelectUser(userId: string) {
    userStore.selectUser(userId);
    playbackStore.stop();
  }

  function handleAddUser(userId: string) {
    userStore.addUser(userId);
    playbackStore.stop();
  }

  // Playback handlers
  function handlePlay() {
    if (!scenarioStore.currentScenario) return;
    playbackStore.play(scenarioStore.currentScenario.messages);
  }

  function handlePause() {
    playbackStore.pause();
  }

  function handleStop() {
    playbackStore.stop();
  }

  // Message handlers
  function handleAddMessage(payload: PubSubPayload, column: number) {
    scenarioStore.addMessage(payload, column);
  }

  function handleSelectMessage(id: string | null) {
    scenarioStore.selectMessage(id);
  }

  function handleDeleteMessage(id: string) {
    scenarioStore.removeMessage(id);
  }

  function handleUpdateColumn(id: string, column: number) {
    scenarioStore.updateColumn(id, column);
  }

  function handleSavePayload(payload: PubSubPayload) {
    if (scenarioStore.selectedMessageId) {
      scenarioStore.updateMessage(scenarioStore.selectedMessageId, payload);
      toast.success("Message updated");
    }
  }

  // Scenario handlers
  function handleNewScenario() {
    const name = `Scenario ${scenarioStore.scenarios.length + 1}`;
    scenarioStore.createScenario(name);
    toast.success("New scenario created");
  }

  function handleSelectScenario(id: string) {
    scenarioStore.selectScenario(id);
    playbackStore.stop();
  }

  async function handleDeleteScenario(id: string) {
    try {
      await scenarioStore.deleteScenario(id);
      toast.success("Scenario deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete scenario");
    }
  }

  function handleClearScenario() {
    scenarioStore.clearScenario();
    toast.success("Scenario cleared");
  }

  // Name editing handlers
  function startEditingName() {
    if (scenarioStore.currentScenario) {
      editedName = scenarioStore.currentScenario.name;
      isEditingName = true;
    }
  }

  function saveEditedName() {
    if (scenarioStore.currentScenarioId && editedName.trim()) {
      scenarioStore.renameScenario(
        scenarioStore.currentScenarioId,
        editedName.trim(),
      );
    }
    isEditingName = false;
  }

  function cancelEditingName() {
    isEditingName = false;
  }

  // Description handlers
  function openDescriptionModal() {
    if (scenarioStore.currentScenario) {
      showDescriptionModal = true;
    }
  }

  function saveDescription(description: string) {
    if (scenarioStore.currentScenarioId) {
      scenarioStore.updateDescription(
        scenarioStore.currentScenarioId,
        description,
      );
      toast.success("Description saved");
    }
    showDescriptionModal = false;
  }

  function closeDescriptionModal() {
    showDescriptionModal = false;
  }

  // Scenario sharing handlers
  async function handleCopyScenario() {
    if (!scenarioStore.currentScenario || !userStore.currentUserId) return;
    const scenario = JSON.parse(JSON.stringify(scenarioStore.currentScenario));
    scenario.name = `${userStore.currentUserId} - ${scenario.name}`;
    await navigator.clipboard.writeText(JSON.stringify(scenario, null, 2));
    toast.success("Scenario copied to clipboard");
  }

  async function handlePasteScenario() {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      toast.error("Could not read clipboard");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("Clipboard does not contain valid JSON");
      return;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      toast.error("Invalid scenario format");
      return;
    }

    const obj = parsed as Record<string, unknown>;
    if (typeof obj.name !== "string" || !obj.name.trim()) {
      toast.error("Invalid scenario: missing name");
      return;
    }
    if (!Array.isArray(obj.messages)) {
      toast.error("Invalid scenario: missing messages");
      return;
    }

    for (const msg of obj.messages) {
      if (typeof msg !== "object" || msg === null) {
        toast.error("Invalid scenario: invalid message format");
        return;
      }
      const m = msg as Record<string, unknown>;
      if (typeof m.column !== "number" || typeof m.payload !== "object" || m.payload === null) {
        toast.error("Invalid scenario: message missing column or payload");
        return;
      }
    }

    try {
      const scenario = parsed as Scenario;
      await scenarioStore.importScenario(scenario);
      toast.success(`${scenario.name} stored`);
    } catch {
      toast.error("Failed to store scenario");
    }
  }

  // Message sample handlers
  function handleEditSample(sample: MessageSample) {
    editingMessageSample = sample;
    showMessageSampleModal = true;
  }

  function handleCreateSample() {
    editingMessageSample = null;
    showMessageSampleModal = true;
  }

  async function handleSaveMessageSample(sample: MessageSample) {
    try {
      const isEditing = editingMessageSample !== null;
      await messageSampleStore.upsertSample(sample);
      toast.success(
        isEditing ? "Message sample updated" : "Message sample created",
      );
      showMessageSampleModal = false;
      editingMessageSample = null;
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to save message sample",
      );
    }
  }

  function closeMessageSampleModal() {
    showMessageSampleModal = false;
    editingMessageSample = null;
  }

  async function handleDeleteMessageSample(messageId: string) {
    try {
      await messageSampleStore.deleteSample(messageId);
      toast.success("Message sample deleted");
      showMessageSampleModal = false;
      editingMessageSample = null;
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to delete message sample",
      );
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement
    ) {
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      if (playbackStore.status === "playing") {
        handlePause();
      } else {
        handlePlay();
      }
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (scenarioStore.selectedMessageId) {
        handleDeleteMessage(scenarioStore.selectedMessageId);
      }
    }

    if (e.key === "Escape") {
      scenarioStore.selectMessage(null);
      showDescriptionModal = false;
      showMessageSampleModal = false;
    }
  }

  // Error toast effect
  $effect(() => {
    if (playbackStore.status === "error" && playbackStore.errors.length) {
      playbackStore.errors.forEach((e) => toast.error(e));
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<Toaster position="bottom-right" />

<div class="flex h-screen flex-col bg-gray-100">
  <header
    class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2"
  >
    <div class="flex items-center gap-4">
      <UserMenu
        users={userStore.users}
        currentUserId={userStore.currentUserId}
        onSelect={handleSelectUser}
        onAdd={handleAddUser}
      />

      {#if userStore.currentUserId}
        <div class="h-6 w-px bg-gray-200"></div>

        <PlaybackControls
          state={playbackStore.state}
          hasMessages={!!scenarioStore.currentScenario?.messages.length}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
        />

        <div class="flex items-center gap-2">
          {#if isEditingName}
            <input
              type="text"
              bind:value={editedName}
              onkeydown={(e) => {
                if (e.key === "Enter") saveEditedName();
                if (e.key === "Escape") cancelEditingName();
              }}
              class="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <button
              onclick={saveEditedName}
              class="rounded p-1 text-green-600 hover:bg-green-50"
            >
              <Check size={16} />
            </button>
            <button
              onclick={cancelEditingName}
              class="rounded p-1 text-gray-400 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          {:else if scenarioStore.currentScenario}
            <span class="font-medium text-gray-700">
              {scenarioStore.currentScenario.name}
            </span>
            <button
              onclick={startEditingName}
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Rename scenario"
            >
              <Pen size={14} />
            </button>
            <button
              onclick={openDescriptionModal}
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600
                {scenarioStore.currentScenario?.description
                ? 'text-blue-500'
                : ''}"
              title="Edit description"
            >
              <FileText size={14} />
            </button>
            <button
              onclick={handleCopyScenario}
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Copy scenario to clipboard"
            >
              <Copy size={14} />
            </button>
          {:else}
            <span class="text-sm text-gray-500">No scenarios</span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {#if userStore.currentUserId}
        <button
          onclick={handleClearScenario}
          disabled={!scenarioStore.currentScenario?.messages.length}
          class="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          title="Clear all messages"
        >
          <Trash2 size={14} />
          Clear
        </button>

        <ScenarioMenu
          scenarios={scenarioStore.scenarios}
          currentScenarioId={scenarioStore.currentScenarioId}
          onNew={handleNewScenario}
          onSelect={handleSelectScenario}
          onDelete={handleDeleteScenario}
          onPaste={handlePasteScenario}
        />
      {/if}
    </div>
  </header>

  <div class="flex flex-1 overflow-hidden">
    <aside
      class="w-70 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white"
    >
      <MessagePalette
        onEditSample={handleEditSample}
        onCreateSample={handleCreateSample}
      />
    </aside>

    <main class="flex flex-1 flex-col overflow-hidden">
      {#if !userStore.currentUserId}
        <div class="flex flex-1 items-center justify-center text-gray-500">
          Select a user to view scenarios
        </div>
      {:else}
        <div class="flex-1 overflow-hidden">
          <Timeline
            messages={scenarioStore.currentScenario?.messages ?? []}
            selectedMessageId={scenarioStore.selectedMessageId}
            currentColumn={playbackStore.currentColumn}
            completedColumns={playbackStore.completedColumns}
            isPlaying={playbackStore.status === "playing"}
            messageResults={playbackStore.messageResults}
            onAddMessage={handleAddMessage}
            onSelectMessage={handleSelectMessage}
            onDeleteMessage={handleDeleteMessage}
            onUpdateColumn={handleUpdateColumn}
          />
        </div>

        <ResizablePanel
          minHeight={128}
          maxHeightRatio={0.8}
          initialHeightRatio={0.64}
        >
          <JsonEditor
            payload={scenarioStore.selectedMessage?.payload ?? null}
            onSave={handleSavePayload}
          />
        </ResizablePanel>
      {/if}
    </main>
  </div>
</div>

{#if showDescriptionModal}
  <DescriptionModal
    title={scenarioStore.currentScenario?.name ?? "Scenario"}
    description={scenarioStore.currentScenario?.description ?? ""}
    onSave={saveDescription}
    onClose={closeDescriptionModal}
  />
{/if}

{#if showMessageSampleModal}
  <MessageSampleModal
    sample={editingMessageSample}
    onSave={handleSaveMessageSample}
    onDelete={handleDeleteMessageSample}
    onClose={closeMessageSampleModal}
  />
{/if}
