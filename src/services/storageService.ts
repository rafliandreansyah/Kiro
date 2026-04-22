import type { AppState, PersistedState } from '../types/index';

const STORAGE_KEY = 'todo-list-app';

const StorageService = {
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  save(state: AppState): void {
    try {
      const persisted: PersistedState = {
        todos: state.todos,
        categories: state.categories,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (error) {
      console.error('StorageService.save failed:', error);
    }
  },

  load(): Partial<AppState> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        todos: parsed.todos,
        categories: parsed.categories,
      };
    } catch (error) {
      console.error('StorageService.load failed:', error);
      return null;
    }
  },
};

export default StorageService;
