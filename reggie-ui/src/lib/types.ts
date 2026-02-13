export interface PubSubPayload {
  className: string;
  topic: string;
  attributes: Record<string, string>;
  message: Record<string, unknown>;
}

export interface ScenarioMessage {
  id: string;
  column: number; // 1-30
  payload: PubSubPayload;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  messages: ScenarioMessage[];
}

export interface MessageTemplate {
  filename: string;
  payload: PubSubPayload;
}

export interface MessageResult {
  status: "success" | "error";
  statusCode?: number;
  statusText?: string;
  errorBody?: string;
  responseBody?: unknown;
}

export interface PlaybackState {
  status: "idle" | "playing" | "paused" | "error";
  currentColumn: number; // 0 = not started, 1-30 = current
  completedColumns: number; // last fully completed column
  errors: string[];
  messageResults: Record<string, MessageResult>; // keyed by message ID
}

export interface MessageSample extends PubSubPayload {
  messageId: string;
}
