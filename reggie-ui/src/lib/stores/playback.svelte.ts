import type { MessageResult, PlaybackState, ScenarioMessage } from "$lib/types";
import { postMessage } from "$lib/utils/api";

class PlaybackStore {
  status = $state<PlaybackState["status"]>("idle");
  currentColumn = $state(0); // 0 = not started, 1-30 = current
  completedColumns = $state(0); // last fully completed column
  errors = $state<string[]>([]);
  messageResults = $state<Record<string, MessageResult>>({});

  private abortController: AbortController | null = null;

  get state(): PlaybackState {
    return {
      status: this.status,
      currentColumn: this.currentColumn,
      completedColumns: this.completedColumns,
      errors: this.errors,
      messageResults: this.messageResults,
    };
  }

  async play(messages: ScenarioMessage[]): Promise<void> {
    if (this.status === "playing") return;

    if (this.status === "paused") {
      this.resume(messages);
      return;
    }

    this.status = "playing";
    this.currentColumn = 0;
    this.completedColumns = 0;
    this.errors = [];
    this.messageResults = {};
    this.abortController = new AbortController();

    await this.executeColumns(messages, 1);
  }

  private async resume(messages: ScenarioMessage[]): Promise<void> {
    this.status = "playing";
    this.abortController = new AbortController();

    // Resume from next column after last completed
    await this.executeColumns(messages, this.completedColumns + 1);
  }

  pause(): void {
    if (this.status !== "playing") return;

    this.status = "paused";
    this.abortController?.abort();
  }

  stop(): void {
    this.status = "idle";
    this.currentColumn = 0;
    this.completedColumns = 0;
    this.errors = [];
    this.messageResults = {};
    this.abortController?.abort();
  }

  private async executeColumns(
    messages: ScenarioMessage[],
    startColumn: number,
  ): Promise<void> {
    for (let col = startColumn; col <= 20; col++) {
      if (this.abortController?.signal.aborted) return;

      const columnMessages = messages.filter((m) => m.column === col);
      if (columnMessages.length === 0) continue;

      this.currentColumn = col;

      // Execute ALL messages in this column in parallel
      const results = await Promise.all(
        columnMessages.map(async (m) => {
          const response = await postMessage(m.payload);
          return { message: m, response };
        }),
      );

      if (this.abortController?.signal.aborted) return;

      // Record results for each message
      let hasError = false;
      for (const { message, response } of results) {
        if (response.ok) {
          this.messageResults = {
            ...this.messageResults,
            [message.id]: {
              status: "success",
              responseBody: response.responseBody,
            },
          };
        } else {
          this.messageResults = {
            ...this.messageResults,
            [message.id]: {
              status: "error",
              statusCode: response.status,
              statusText: response.statusText,
              errorBody: response.errorBody,
            },
          };
          hasError = true;
        }
      }

      // If ANY failed, stop playback
      if (hasError) {
        this.status = "error";
        const failedMsg = results.find((r) => !r.response.ok);
        if (failedMsg) {
          console.log({ failedMsg });
          this.errors = results
            .filter((r) => !r.response.ok)
            .map((r) => `Failed to send ${r.message.payload.className}`);
        }
        return;
      }

      this.completedColumns = col;

      // Delay between columns
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 750);
        this.abortController?.signal.addEventListener("abort", () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (this.abortController?.signal.aborted) return;
    }

    if (this.status === "playing") {
      this.status = "idle";
    }
  }
}

export const playbackStore = new PlaybackStore();
