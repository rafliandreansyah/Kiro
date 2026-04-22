import { describe, test, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import StorageService from '../../services/storageService';
import type { AppState, Todo, Category } from '../../types/index';

// Arbitrary generators
const validTodoTitleArb = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

const todoArb = fc.record({
  id: fc.uuid(),
  title: validTodoTitleArb,
  status: fc.constantFrom('Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  dueDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: null }),
  createdAt: fc.date().map(d => d.toISOString()),
});

const categoryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
});

// Simple in-memory localStorage mock
function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
}

describe('StorageService property tests', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Feature: todo-list-app, Property 20: Round-Trip Serialisasi Storage
  // Validates: Requirements 9.4, 9.5
  test('serialize lalu deserialize harus menghasilkan state yang identik', () => {
    const stateArb = fc.record({
      todos: fc.array(todoArb, { minLength: 0, maxLength: 10 }),
      categories: fc.array(categoryArb, { minLength: 0, maxLength: 5 }),
    });

    fc.assert(
      fc.property(stateArb, ({ todos, categories }) => {
        // Build a minimal AppState for save()
        const appState: AppState = {
          todos: todos as Todo[],
          categories: categories as Category[],
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

        // Serialize
        StorageService.save(appState);

        // Deserialize
        const loaded = StorageService.load();

        if (loaded === null) return false;

        // Verify todos round-trip
        const loadedTodos = loaded.todos ?? [];
        if (loadedTodos.length !== todos.length) return false;
        for (let i = 0; i < todos.length; i++) {
          const original = todos[i];
          const restored = loadedTodos[i];
          if (
            restored.id !== original.id ||
            restored.title !== original.title ||
            restored.status !== original.status ||
            restored.priority !== original.priority ||
            restored.category !== original.category ||
            restored.dueDate !== original.dueDate ||
            restored.createdAt !== original.createdAt
          ) {
            return false;
          }
        }

        // Verify categories round-trip
        const loadedCategories = loaded.categories ?? [];
        if (loadedCategories.length !== categories.length) return false;
        for (let i = 0; i < categories.length; i++) {
          const original = categories[i];
          const restored = loadedCategories[i];
          if (restored.id !== original.id || restored.name !== original.name) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 8: Persistensi Otomatis Setelah Operasi CRUD
// Validates: Requirements 3.4, 4.6, 9.1
describe('Property 8: Persistensi Otomatis Setelah Operasi CRUD', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('state di storage mencerminkan state terbaru setelah operasi CRUD', async () => {
    const { todoReducer, initialState } = await import('../../context/todoReducer');

    const todoInputArb = fc.record({
      title: validTodoTitleArb,
      priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
      category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
      dueDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: null }),
    });

    fc.assert(
      fc.property(
        fc.array(todoInputArb, { minLength: 1, maxLength: 5 }),
        (todoInputs) => {
          // Start with empty state
          let state = initialState;

          // ADD_TODO: add all todos
          for (const input of todoInputs) {
            state = todoReducer(state, { type: 'ADD_TODO', payload: input });
          }

          // Persist and verify after ADD
          StorageService.save(state);
          const afterAdd = StorageService.load();
          if (!afterAdd) return false;
          if ((afterAdd.todos ?? []).length !== state.todos.length) return false;

          // TOGGLE_TODO: toggle the first todo
          const firstId = state.todos[0].id;
          const statusBefore = state.todos[0].status;
          state = todoReducer(state, { type: 'TOGGLE_TODO', payload: firstId });

          StorageService.save(state);
          const afterToggle = StorageService.load();
          if (!afterToggle) return false;
          const toggledTodo = (afterToggle.todos ?? []).find(t => t.id === firstId);
          if (!toggledTodo) return false;
          const expectedStatus = statusBefore === 'Belum Selesai' ? 'Selesai' : 'Belum Selesai';
          if (toggledTodo.status !== expectedStatus) return false;

          // UPDATE_TODO: update the first todo title
          const updatedInput = {
            title: 'Updated Title',
            priority: 'Tinggi' as const,
            category: null,
            dueDate: null,
          };
          state = todoReducer(state, { type: 'UPDATE_TODO', payload: { id: firstId, data: updatedInput } });

          StorageService.save(state);
          const afterUpdate = StorageService.load();
          if (!afterUpdate) return false;
          const updatedTodo = (afterUpdate.todos ?? []).find(t => t.id === firstId);
          if (!updatedTodo) return false;
          if (updatedTodo.title !== 'Updated Title') return false;

          // DELETE_TODO: delete the first todo
          state = todoReducer(state, { type: 'DELETE_TODO', payload: firstId });

          StorageService.save(state);
          const afterDelete = StorageService.load();
          if (!afterDelete) return false;
          const deletedTodo = (afterDelete.todos ?? []).find(t => t.id === firstId);
          if (deletedTodo !== undefined) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 21: Reload Memuat Data dari Storage
// Validates: Requirements 9.2
describe('Property 21: Reload Memuat Data dari Storage', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('simulasi reload menghasilkan state identik dengan state yang disimpan', () => {
    const stateArb = fc.record({
      todos: fc.array(todoArb, { minLength: 0, maxLength: 10 }),
      categories: fc.array(categoryArb, { minLength: 0, maxLength: 5 }),
    });

    fc.assert(
      fc.property(stateArb, ({ todos, categories }) => {
        const appState: AppState = {
          todos: todos as Todo[],
          categories: categories as Category[],
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

        // Simulate "save before unload"
        StorageService.save(appState);

        // Simulate "reload": load from storage (as AppContext would on mount)
        const reloaded = StorageService.load();

        if (reloaded === null) return todos.length === 0 && categories.length === 0;

        // Verify todos are identical after reload
        const reloadedTodos = reloaded.todos ?? [];
        if (reloadedTodos.length !== todos.length) return false;
        for (let i = 0; i < todos.length; i++) {
          const orig = todos[i] as Todo;
          const rest = reloadedTodos[i];
          if (
            rest.id !== orig.id ||
            rest.title !== orig.title ||
            rest.status !== orig.status ||
            rest.priority !== orig.priority ||
            rest.category !== orig.category ||
            rest.dueDate !== orig.dueDate ||
            rest.createdAt !== orig.createdAt
          ) {
            return false;
          }
        }

        // Verify categories are identical after reload
        const reloadedCategories = reloaded.categories ?? [];
        if (reloadedCategories.length !== categories.length) return false;
        for (let i = 0; i < categories.length; i++) {
          const orig = categories[i] as Category;
          const rest = reloadedCategories[i];
          if (rest.id !== orig.id || rest.name !== orig.name) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
