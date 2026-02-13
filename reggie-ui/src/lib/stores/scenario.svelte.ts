import type { Scenario, ScenarioMessage, PubSubPayload } from '$lib/types';
import { getUserScenarios, upsertUserScenario, deleteUserScenario } from '$lib/utils/api';

function generateId(): string {
	return crypto.randomUUID();
}

class ScenarioStore {
	scenarios = $state<Scenario[]>([]);
	currentScenarioId = $state<string | null>(null);
	selectedMessageId = $state<string | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);
	userId = $state<string | null>(null);

	currentScenario = $derived(
		this.scenarios.find((s) => s.id === this.currentScenarioId) ?? null
	);

	selectedMessage = $derived(
		this.currentScenario?.messages.find((m) => m.id === this.selectedMessageId) ?? null
	);

	async loadForUser(userId: string): Promise<void> {
		this.userId = userId;
		this.isLoading = true;
		this.error = null;
		try {
			const scenarios = await getUserScenarios(userId);
			this.scenarios = scenarios.map((s) => ({
				...s,
				description: s.description ?? ''
			}));
			this.currentScenarioId = this.scenarios[0]?.id ?? null;
			this.selectedMessageId = null;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load scenarios';
			console.error('Failed to load scenarios:', e);
		} finally {
			this.isLoading = false;
		}
	}

	clearForNoUser(): void {
		this.userId = null;
		this.scenarios = [];
		this.currentScenarioId = null;
		this.selectedMessageId = null;
		this.isLoading = false;
		this.error = null;
	}

	private async persistScenario(scenario: Scenario): Promise<void> {
		if (!this.userId) throw new Error('No user selected');
		try {
			await upsertUserScenario(this.userId, scenario);
		} catch (e) {
			console.error('Failed to save scenario:', e);
			throw e;
		}
	}

	async importScenario(source: Scenario): Promise<string> {
		if (!this.userId) throw new Error('No user selected');
		const scenario: Scenario = {
			id: generateId(),
			name: source.name,
			description: source.description ?? '',
			messages: source.messages.map((m) => ({
				id: generateId(),
				column: m.column,
				payload: structuredClone(m.payload)
			}))
		};
		this.scenarios = [...this.scenarios, scenario];
		this.currentScenarioId = scenario.id;
		this.selectedMessageId = null;
		await this.persistScenario(scenario);
		return scenario.id;
	}

	async createScenario(name: string): Promise<string> {
		if (!this.userId) throw new Error('No user selected');
		const scenario: Scenario = {
			id: generateId(),
			name,
			description: '',
			messages: []
		};
		this.scenarios = [...this.scenarios, scenario];
		this.currentScenarioId = scenario.id;
		this.selectedMessageId = null;
		await this.persistScenario(scenario);
		return scenario.id;
	}

	async deleteScenario(id: string): Promise<void> {
		if (!this.userId) return;
		this.scenarios = this.scenarios.filter((s) => s.id !== id);
		if (this.currentScenarioId === id) {
			this.currentScenarioId = this.scenarios[0]?.id ?? null;
			this.selectedMessageId = null;
		}
		await deleteUserScenario(this.userId, id);
	}

	async renameScenario(id: string, name: string): Promise<void> {
		const scenario = this.scenarios.find((s) => s.id === id);
		if (!scenario) return;

		const updated = { ...scenario, name };
		this.scenarios = this.scenarios.map((s) => (s.id === id ? updated : s));
		await this.persistScenario(updated);
	}

	async updateDescription(id: string, description: string): Promise<void> {
		const scenario = this.scenarios.find((s) => s.id === id);
		if (!scenario) return;

		const updated = { ...scenario, description };
		this.scenarios = this.scenarios.map((s) => (s.id === id ? updated : s));
		await this.persistScenario(updated);
	}

	selectScenario(id: string): void {
		this.currentScenarioId = id;
		this.selectedMessageId = null;
	}

	async addMessage(payload: PubSubPayload, column: number = 1): Promise<string> {
		if (!this.currentScenarioId) return '';

		const message: ScenarioMessage = {
			id: generateId(),
			column: Math.min(20, Math.max(1, column)),
			payload: structuredClone(payload)
		};

		const scenario = this.scenarios.find((s) => s.id === this.currentScenarioId);
		if (!scenario) return '';

		const updated = { ...scenario, messages: [...scenario.messages, message] };
		this.scenarios = this.scenarios.map((s) =>
			s.id === this.currentScenarioId ? updated : s
		);
		this.selectedMessageId = message.id;
		await this.persistScenario(updated);
		return message.id;
	}

	async removeMessage(messageId: string): Promise<void> {
		if (!this.currentScenarioId) return;

		const scenario = this.scenarios.find((s) => s.id === this.currentScenarioId);
		if (!scenario) return;

		const updated = { ...scenario, messages: scenario.messages.filter((m) => m.id !== messageId) };
		this.scenarios = this.scenarios.map((s) =>
			s.id === this.currentScenarioId ? updated : s
		);

		if (this.selectedMessageId === messageId) {
			this.selectedMessageId = null;
		}
		await this.persistScenario(updated);
	}

	async updateMessage(messageId: string, payload: PubSubPayload): Promise<void> {
		if (!this.currentScenarioId) return;

		const scenario = this.scenarios.find((s) => s.id === this.currentScenarioId);
		if (!scenario) return;

		const updated = {
			...scenario,
			messages: scenario.messages.map((m) =>
				m.id === messageId ? { ...m, payload: structuredClone(payload) } : m
			)
		};
		this.scenarios = this.scenarios.map((s) =>
			s.id === this.currentScenarioId ? updated : s
		);
		await this.persistScenario(updated);
	}

	async updateColumn(messageId: string, column: number): Promise<void> {
		if (!this.currentScenarioId) return;

		const scenario = this.scenarios.find((s) => s.id === this.currentScenarioId);
		if (!scenario) return;

		const updated = {
			...scenario,
			messages: scenario.messages.map((m) =>
				m.id === messageId ? { ...m, column: Math.min(20, Math.max(1, column)) } : m
			)
		};
		this.scenarios = this.scenarios.map((s) =>
			s.id === this.currentScenarioId ? updated : s
		);
		await this.persistScenario(updated);
	}

	selectMessage(messageId: string | null): void {
		this.selectedMessageId = messageId;
	}

	async clearScenario(): Promise<void> {
		if (!this.currentScenarioId) return;

		const scenario = this.scenarios.find((s) => s.id === this.currentScenarioId);
		if (!scenario) return;

		const updated = { ...scenario, messages: [] };
		this.scenarios = this.scenarios.map((s) =>
			s.id === this.currentScenarioId ? updated : s
		);
		this.selectedMessageId = null;
		await this.persistScenario(updated);
	}
}

export const scenarioStore = new ScenarioStore();
