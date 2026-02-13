import { getUsers } from '$lib/utils/api';

const STORAGE_KEY = 'reggie-selected-user';

class UserStore {
	users = $state<string[]>([]);
	currentUserId = $state<string | null>(null);
	isLoading = $state(true);
	error = $state<string | null>(null);

	constructor() {
		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	private async init(): Promise<void> {
		try {
			this.isLoading = true;
			this.error = null;
			this.users = await getUsers();

			// Restore selected user from localStorage if still valid
			const savedUserId = localStorage.getItem(STORAGE_KEY);
			if (savedUserId && this.users.includes(savedUserId)) {
				this.currentUserId = savedUserId;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load users';
			console.error('Failed to load users:', e);
		} finally {
			this.isLoading = false;
		}
	}

	selectUser(userId: string | null): void {
		this.currentUserId = userId;
		if (userId) {
			localStorage.setItem(STORAGE_KEY, userId);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	addUser(userId: string): void {
		if (!this.users.includes(userId)) {
			this.users = [...this.users, userId];
		}
		this.selectUser(userId);
	}
}

export const userStore = new UserStore();
