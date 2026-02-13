import type { MessageSample, PubSubPayload, Scenario } from "$lib/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const PUBLISH_URL = `${API_BASE}/publish`;

export interface PublishResult {
  ok: boolean;
  status: number;
  statusText: string;
  errorBody?: string;
  responseBody?: unknown;
}

export async function postMessage(
  payload: PubSubPayload,
): Promise<PublishResult> {
  try {
    const response = await fetch(PUBLISH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let errorBody: string | undefined;
    let responseBody: unknown | undefined;

    if (response.ok) {
      try {
        const text = await response.text();
        if (text) {
          responseBody = JSON.parse(text);
        }
      } catch {
        // Ignore error reading/parsing body
      }
    } else {
      try {
        errorBody = await response.text();
      } catch {
        // Ignore error reading body
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      errorBody,
      responseBody,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error instanceof Error ? error.message : "Network error",
    };
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scenario API
export async function getAllScenarios(): Promise<Scenario[]> {
  const response = await fetch(`${API_BASE}/scenarios`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
  }
  return response.json();
}

export async function upsertScenario(scenario: Scenario): Promise<Scenario> {
  const response = await fetch(`${API_BASE}/scenarios`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario),
  });
  if (!response.ok) {
    throw new Error(`Failed to save scenario: ${response.statusText}`);
  }
  return response.json();
}

// Message Sample API
export async function getAllMessageSamples(): Promise<MessageSample[]> {
  const response = await fetch(`${API_BASE}/message-samples`);
  if (!response.ok) {
    throw new Error(`Failed to fetch message samples: ${response.statusText}`);
  }
  return response.json();
}

export async function upsertMessageSample(
  sample: MessageSample,
): Promise<MessageSample> {
  const response = await fetch(`${API_BASE}/message-samples`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sample),
  });
  if (!response.ok) {
    throw new Error(`Failed to save message sample: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteScenario(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/scenarios/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete scenario: ${response.statusText}`);
  }
}

export async function deleteMessageSample(messageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/message-samples/${messageId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete message sample: ${response.statusText}`);
  }
}

// User API
export async function getUsers(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

export async function getUserScenarios(userId: string): Promise<Scenario[]> {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/scenarios`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
  }
  return response.json();
}

export async function upsertUserScenario(userId: string, scenario: Scenario): Promise<Scenario> {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/scenarios`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario),
  });
  if (!response.ok) {
    throw new Error(`Failed to save scenario: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteUserScenario(userId: string, scenarioId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/scenarios/${scenarioId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete scenario: ${response.statusText}`);
  }
}
