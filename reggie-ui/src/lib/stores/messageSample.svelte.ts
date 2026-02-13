import type { MessageSample } from "$lib/types";
import { getAllMessageSamples, upsertMessageSample, deleteMessageSample } from "$lib/utils/api";

class MessageSampleStore {
  samples = $state<MessageSample[]>([]);
  isLoading = $state(true);
  error = $state<string | null>(null);

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private async init(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.samples = await getAllMessageSamples();
    } catch (e) {
      this.error =
        e instanceof Error ? e.message : "Failed to load message samples";
      console.error("Failed to load message samples:", e);
    } finally {
      this.isLoading = false;
    }
  }

  async upsertSample(sample: MessageSample): Promise<MessageSample> {
    const existingIndex = this.samples.findIndex(
      (s) => s.messageId === sample.messageId,
    );
    const isNew = existingIndex === -1;

    // Optimistic update
    if (isNew) {
      this.samples = [...this.samples, sample];
    } else {
      this.samples = this.samples.map((s) =>
        s.messageId === sample.messageId ? sample : s,
      );
    }

    try {
      const saved = await upsertMessageSample(sample);
      // Update with server response
      this.samples = this.samples.map((s) =>
        s.messageId === saved.messageId ? saved : s,
      );
      return saved;
    } catch (e) {
      // Rollback on error
      if (isNew) {
        this.samples = this.samples.filter(
          (s) => s.messageId !== sample.messageId,
        );
      }
      throw e;
    }
  }

  async reload(): Promise<void> {
    await this.init();
  }

  async deleteSample(messageId: string): Promise<void> {
    // Optimistic update
    const removed = this.samples.find((s) => s.messageId === messageId);
    this.samples = this.samples.filter((s) => s.messageId !== messageId);

    try {
      await deleteMessageSample(messageId);
    } catch (e) {
      // Rollback on error
      if (removed) {
        this.samples = [...this.samples, removed];
      }
      throw e;
    }
  }
}

export const messageSampleStore = new MessageSampleStore();
