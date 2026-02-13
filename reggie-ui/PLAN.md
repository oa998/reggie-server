# Implementation Plan: Replace localStorage with Server APIs

## Status: COMPLETED

---

## Summary of Changes

### New Files Created
1. **`src/lib/stores/messageSample.svelte.ts`** - New store for managing message samples from server
2. **`src/lib/components/MessageSampleModal.svelte`** - Modal for creating/editing message samples

### Files Modified
1. **`src/lib/types.ts`** - Added `MessageSample` interface
2. **`src/lib/utils/api.ts`** - Added API functions for scenarios and message samples
3. **`src/lib/stores/scenario.svelte.ts`** - Replaced localStorage with server API calls
4. **`src/lib/components/MessagePalette.svelte`** - Now uses store, added "Add Message Type" button and double-click editing
5. **`src/routes/+page.svelte`** - Wired up the MessageSampleModal

---

## API Integration

### Scenarios
- `GET /scenarios` - Called on app init to load all scenarios
- `PUT /scenarios` - Called on every scenario modification (create, rename, update description, add/remove/update messages)

### Message Samples
- `GET /message-samples` - Called on app init to load all samples
- `PUT /message-samples` - Called when creating or editing a sample

---

## Features Implemented

1. **Server-side scenario persistence** - All scenario changes sync to server via PUT /scenarios
2. **Server-side message sample persistence** - Samples load from and save to server
3. **"Add Message Type" button** - In the left palette, allows creating new samples
4. **Double-click to edit samples** - Double-click any sample in the palette to open edit modal
5. **MessageSampleModal** - Full form for editing sample name, className, topic, attributes, and message body
6. **Loading and error states** - Both stores track loading/error states
7. **Optimistic updates** - UI updates immediately, with rollback on error

---

## Notes

- Delete operations for scenarios only remove locally (no DELETE endpoint provided)
- Toast notifications show on save success/failure
- Escape key closes modals
- The modal validates required fields and JSON syntax before saving
