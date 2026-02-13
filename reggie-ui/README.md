# Reggie UI

A visual scenario builder and playback tool for orchestrating PubSub message sequences. Build scenarios by dragging message templates onto a timeline, arrange them in columns for sequential or parallel execution, then play them back against a local endpoint.

## Features

- **Visual Timeline**: 30-column grid where each column represents an execution step
- **Drag & Drop**: Drag message templates from a palette onto the timeline
- **Parallel Execution**: Messages in the same column execute simultaneously
- **Sequential Flow**: Playback proceeds column by column, waiting for all messages in a column to complete before advancing
- **Error Handling**: Failed messages show red indicators with clickable popovers displaying error details
- **Scenario Management**: Create, rename, delete, and switch between multiple scenarios
- **Scenario Descriptions**: Add detailed text descriptions to document each scenario
- **Message Sample Management**: Create and edit message templates via a modal editor
- **Server-Side Persistence**: Scenarios and message samples are stored on the server via REST APIs
- **JSON Editor**: Edit message payloads directly with a resizable JSON editor panel

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build (outputs to /build)
pnpm preview      # Preview production build
pnpm check        # Type-check with svelte-check
pnpm lint         # Run ESLint
```

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (runes: `$props()`, `$state()`, `$derived()`, `$effect()`)
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-svelte
- **Notifications**: svelte-french-toast
- **Build**: Vite 7, static adapter (SPA mode)
- **Package Manager**: pnpm

## Project Structure

```
src/
├── routes/
│   └── +page.svelte              # Main application page
├── lib/
│   ├── components/
│   │   ├── Timeline.svelte       # Timeline grid with lanes and columns
│   │   ├── MessageBlock.svelte   # Draggable message on timeline
│   │   ├── MessagePalette.svelte # Sidebar with available message templates
│   │   ├── MessageSampleModal.svelte # Create/edit message samples
│   │   ├── Playhead.svelte       # Current column indicator during playback
│   │   ├── PlaybackControls.svelte # Play/pause/stop buttons
│   │   ├── JsonEditor.svelte     # JSON payload editor
│   │   ├── ResizablePanel.svelte # Vertically resizable container
│   │   ├── ScenarioMenu.svelte   # Scenario selection dropdown
│   │   ├── DescriptionModal.svelte # Scenario description editor
│   │   └── ErrorPopover.svelte   # Error details popover
│   ├── stores/
│   │   ├── scenario.svelte.ts    # Scenario state management
│   │   ├── messageSample.svelte.ts # Message sample state management
│   │   └── playback.svelte.ts    # Playback execution logic
│   ├── utils/
│   │   └── api.ts                # HTTP client for all API calls
│   └── types.ts                  # TypeScript interfaces
```

## Key Data Types

```typescript
interface PubSubPayload {
  className: string;
  topic: string;
  attributes: Record<string, string>;
  message: Record<string, unknown>;
}

interface MessageSample extends PubSubPayload {
  messageId: string;
}

interface ScenarioMessage {
  id: string;
  column: number;  // 1-30
  payload: PubSubPayload;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  messages: ScenarioMessage[];
}
```

## Architecture Notes

### Timeline Layout
- Fixed label column (120px) on the left showing className
- 30 equal-width columns (120px each) for message placement
- Messages snap to columns when dragged
- Horizontal scrolling for columns beyond viewport

### Playback Execution
- Iterates columns 1-30 sequentially
- All messages in a column execute in parallel via `Promise.all()`
- If any message fails, playback stops with error status
- Results (success/error) are tracked per message ID

### State Management
- `scenarioStore`: Manages scenarios, messages, selection (persisted to server)
- `messageSampleStore`: Manages message templates (persisted to server)
- `playbackStore`: Manages playback status, current column, message results (not persisted)

## Server API

The application requires a backend server running at `http://localhost:8080` with the following endpoints:

### Scenarios
- `GET /scenarios` - Retrieve all scenarios
- `PUT /scenarios` - Create or update a scenario
- `DELETE /scenarios/{id}` - Delete a scenario

### Message Samples
- `GET /message-samples` - Retrieve all message samples
- `PUT /message-samples` - Create or update a message sample
- `DELETE /message-samples/{messageId}` - Delete a message sample

### Message Publishing
- `POST /publish` - Publish a message (used during playback)

## Message Sample Management

Message samples (templates) can be managed directly in the UI:

1. **Create**: Click the "Add Message Type" button in the left palette
2. **Edit**: Double-click any existing message sample in the palette
3. **Delete**: Click the delete button in the modal editor when editing an existing sample

The modal editor provides a JSON interface for defining the sample's `className`, `topic`, `attributes`, and `message` fields.

## Configuration

### Changing Column Count
The column count (30) is defined in multiple places:
- `Timeline.svelte`: `TOTAL_COLUMNS`
- `scenario.svelte.ts`: `addMessage()` and `updateColumn()` constraints
- `playback.svelte.ts`: `executeColumns()` loop limit
- `MessageBlock.svelte`: `handleDrag()` constraint
- `PlaybackControls.svelte`: `formatColumn()` display
