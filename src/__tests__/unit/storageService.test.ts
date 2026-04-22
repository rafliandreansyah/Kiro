import { describe, test, expect, vi, beforeEach } from 'vitest';
import StorageService from '../../services/storageService';
import type { AppState, Todo, Category } from '../../types/index';

const STORAGE_KEY = 'todo-list-app';

const mockTodo: Todo = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Todo',
  status: 'Belum Selesai',
  priority: 'Sedang',
  category: null,
  dueDate: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockCategory: Category = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  name: 'Pekerjaan',
};

const mockAppState: AppState = {
  todos: [mockTodo],
  categories: [mockCategory],
  filter: {
    status: 'Semua',
    priority: 'Semua',
    category: null,
    search: '',
  },
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  notification: null,
};

describe('StorageService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('load()', () => {
    test('mengembalikan null saat storage kosong', () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = StorageService.load();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toBeNull();
    });

    test('mengembalikan state yang benar saat data valid', () => {
      const persisted = {
        todos: [mockTodo],
        categories: [mockCategory],
      };
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify(persisted)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = StorageService.load();

      expect(result).not.toBeNull();
      expect(result?.todos).toEqual([mockTodo]);
      expect(result?.categories).toEqual([mockCategory]);
    });

    test('mengembalikan null saat data korup (JSON tidak valid)', () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('{ ini bukan json valid !!!'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = StorageService.load();

      expect(result).toBeNull();
    });

    test('mengembalikan null saat localStorage.getItem melempar error', () => {
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('Storage error');
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = StorageService.load();

      expect(result).toBeNull();
    });
  });

  describe('save()', () => {
    test('menyimpan todos dan categories ke localStorage', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      StorageService.save(mockAppState);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({ todos: mockAppState.todos, categories: mockAppState.categories })
      );
    });

    test('tidak menyimpan filter, sort, dan notification', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      StorageService.save(mockAppState);

      const savedValue = mockLocalStorage.setItem.mock.calls[0][1] as string;
      const parsed = JSON.parse(savedValue);
      expect(parsed).not.toHaveProperty('filter');
      expect(parsed).not.toHaveProperty('sort');
      expect(parsed).not.toHaveProperty('notification');
    });

    test('tidak melempar error saat localStorage.setItem gagal', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('QuotaExceededError');
        }),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      expect(() => StorageService.save(mockAppState)).not.toThrow();
    });
  });

  describe('save() + load() round-trip', () => {
    test('data yang disimpan dapat dimuat kembali dengan benar', () => {
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      StorageService.save(mockAppState);
      const loaded = StorageService.load();

      expect(loaded).not.toBeNull();
      expect(loaded?.todos).toEqual(mockAppState.todos);
      expect(loaded?.categories).toEqual(mockAppState.categories);
    });

    test('round-trip dengan state kosong (todos dan categories kosong)', () => {
      const emptyState: AppState = {
        ...mockAppState,
        todos: [],
        categories: [],
      };
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      StorageService.save(emptyState);
      const loaded = StorageService.load();

      expect(loaded?.todos).toEqual([]);
      expect(loaded?.categories).toEqual([]);
    });

    test('round-trip mempertahankan semua field Todo', () => {
      const todoLengkap: Todo = {
        id: 'abc-123',
        title: 'Todo dengan semua field',
        status: 'Selesai',
        priority: 'Tinggi',
        category: 'Pekerjaan',
        dueDate: '2024-12-31',
        createdAt: '2024-06-01T10:00:00.000Z',
      };
      const stateWithFullTodo: AppState = { ...mockAppState, todos: [todoLengkap] };
      const store: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      StorageService.save(stateWithFullTodo);
      const loaded = StorageService.load();

      expect(loaded?.todos[0]).toEqual(todoLengkap);
    });
  });
});
