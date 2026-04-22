import { describe, test } from 'vitest';
import fc from 'fast-check';
import { todoReducer, initialState } from '../../context/todoReducer';
import type { AppState, Todo, TodoInput } from '../../types/index';

// Arbitrary generators
const validTodoTitleArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

const todoArb = fc.record({
  id: fc.uuid(),
  title: validTodoTitleArb,
  status: fc.constantFrom('Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  dueDate: fc.option(fc.date().map((d) => d.toISOString().split('T')[0]), { nil: null }),
  createdAt: fc.date().map((d) => d.toISOString()),
});

const todoInputArb = fc.record({
  title: validTodoTitleArb,
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  dueDate: fc.option(fc.date().map((d) => d.toISOString().split('T')[0]), { nil: null }),
});

/** Build an AppState with a given list of todos */
function stateWithTodos(todos: Todo[]): AppState {
  return { ...initialState, todos };
}

describe('todoReducer property tests', () => {
  // Feature: todo-list-app, Property 7: Toggle Status adalah Round-Trip
  // Validates: Requirements 3.2, 3.3
  test('Property 7: toggle dua kali mengembalikan status semula', () => {
    fc.assert(
      fc.property(fc.array(todoArb, { minLength: 1, maxLength: 10 }), (todos) => {
        const state = stateWithTodos(todos);
        const target = todos[0];

        const afterFirst = todoReducer(state, { type: 'TOGGLE_TODO', payload: target.id });
        const afterSecond = todoReducer(afterFirst, { type: 'TOGGLE_TODO', payload: target.id });

        const original = state.todos.find((t) => t.id === target.id)!;
        const result = afterSecond.todos.find((t) => t.id === target.id)!;

        return result.status === original.status;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo-list-app, Property 1: Penambahan Todo Menghasilkan Todo di List
  // Validates: Requirements 1.2
  test('Property 1: todo baru ada di list dengan status "Belum Selesai"', () => {
    fc.assert(
      fc.property(fc.array(todoArb, { maxLength: 10 }), todoInputArb, (todos, input) => {
        const state = stateWithTodos(todos);
        const nextState = todoReducer(state, { type: 'ADD_TODO', payload: input });

        // Jumlah todo bertambah satu
        if (nextState.todos.length !== todos.length + 1) return false;

        // Todo baru ada di list
        const newTodo = nextState.todos.find((t) => t.title === input.title);
        if (!newTodo) return false;

        // Status default "Belum Selesai"
        if (newTodo.status !== 'Belum Selesai') return false;

        // Atribut lain sesuai input
        if (newTodo.priority !== input.priority) return false;
        if (newTodo.category !== input.category) return false;
        if (newTodo.dueDate !== input.dueDate) return false;

        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todo-list-app, Property 10: Simpan Edit Memperbarui Todo
  // Validates: Requirements 4.3
  test('Property 10: UPDATE_TODO — data baru ada, data lama tidak ada', () => {
    fc.assert(
      fc.property(
        fc.array(todoArb, { minLength: 1, maxLength: 10 }),
        todoInputArb,
        (todos, newData) => {
          const state = stateWithTodos(todos);
          const target = todos[0];

          const nextState = todoReducer(state, {
            type: 'UPDATE_TODO',
            payload: { id: target.id, data: newData },
          });

          const updated = nextState.todos.find((t) => t.id === target.id);
          if (!updated) return false;

          // Data baru ada
          if (updated.title !== newData.title) return false;
          if (updated.priority !== newData.priority) return false;
          if (updated.category !== newData.category) return false;
          if (updated.dueDate !== newData.dueDate) return false;

          // Jumlah todo tidak berubah
          if (nextState.todos.length !== todos.length) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: todo-list-app, Property 12: Konfirmasi Hapus Menghilangkan Todo
  // Validates: Requirements 5.3
  test('Property 12: DELETE_TODO — todo tidak ada di list setelah hapus', () => {
    fc.assert(
      fc.property(fc.array(todoArb, { minLength: 1, maxLength: 10 }), (todos) => {
        const state = stateWithTodos(todos);
        const target = todos[0];

        const nextState = todoReducer(state, { type: 'DELETE_TODO', payload: target.id });

        // Todo yang dihapus tidak ada lagi
        const found = nextState.todos.find((t) => t.id === target.id);
        if (found) return false;

        // Jumlah todo berkurang satu
        if (nextState.todos.length !== todos.length - 1) return false;

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests (example-based) ───────────────────────────────────────────────

describe('todoReducer unit tests', () => {
  // ── ADD_TODO ────────────────────────────────────────────────────────────────
  describe('ADD_TODO', () => {
    test('menambahkan todo baru ke list kosong', () => {
      const input: TodoInput = { title: 'Beli susu', priority: 'Sedang', category: null, dueDate: null };
      const next = todoReducer(initialState, { type: 'ADD_TODO', payload: input });

      expect(next.todos).toHaveLength(1);
      const todo = next.todos[0];
      expect(todo.title).toBe('Beli susu');
      expect(todo.priority).toBe('Sedang');
      expect(todo.category).toBeNull();
      expect(todo.dueDate).toBeNull();
    });

    test('status default adalah "Belum Selesai"', () => {
      const input: TodoInput = { title: 'Tugas A', priority: 'Tinggi', category: null, dueDate: null };
      const next = todoReducer(initialState, { type: 'ADD_TODO', payload: input });
      expect(next.todos[0].status).toBe('Belum Selesai');
    });

    test('menghasilkan id unik (UUID)', () => {
      const input: TodoInput = { title: 'Tugas B', priority: 'Rendah', category: null, dueDate: null };
      const s1 = todoReducer(initialState, { type: 'ADD_TODO', payload: input });
      const s2 = todoReducer(s1, { type: 'ADD_TODO', payload: input });
      expect(s2.todos[0].id).not.toBe(s2.todos[1].id);
    });

    test('menyetel createdAt sebagai ISO string', () => {
      const before = Date.now();
      const input: TodoInput = { title: 'Tugas C', priority: 'Sedang', category: null, dueDate: null };
      const next = todoReducer(initialState, { type: 'ADD_TODO', payload: input });
      const after = Date.now();
      const ts = new Date(next.todos[0].createdAt).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    test('tidak mengubah todo yang sudah ada', () => {
      const existing: Todo = {
        id: 'abc', title: 'Lama', status: 'Selesai', priority: 'Rendah',
        category: null, dueDate: null, createdAt: '2024-01-01T00:00:00.000Z',
      };
      const state = stateWithTodos([existing]);
      const next = todoReducer(state, { type: 'ADD_TODO', payload: { title: 'Baru', priority: 'Tinggi', category: null, dueDate: null } });
      expect(next.todos).toHaveLength(2);
      expect(next.todos[0]).toEqual(existing);
    });
  });

  // ── UPDATE_TODO ─────────────────────────────────────────────────────────────
  describe('UPDATE_TODO', () => {
    const base: Todo = {
      id: 'id-1', title: 'Asli', status: 'Belum Selesai', priority: 'Rendah',
      category: null, dueDate: null, createdAt: '2024-01-01T00:00:00.000Z',
    };
    const other: Todo = {
      id: 'id-2', title: 'Lain', status: 'Selesai', priority: 'Tinggi',
      category: 'Kerja', dueDate: '2024-12-31', createdAt: '2024-01-02T00:00:00.000Z',
    };

    test('memperbarui todo yang sesuai id', () => {
      const state = stateWithTodos([base, other]);
      const next = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: { id: 'id-1', data: { title: 'Diperbarui', priority: 'Tinggi', category: 'Rumah', dueDate: '2025-06-01' } },
      });
      const updated = next.todos.find((t) => t.id === 'id-1')!;
      expect(updated.title).toBe('Diperbarui');
      expect(updated.priority).toBe('Tinggi');
      expect(updated.category).toBe('Rumah');
      expect(updated.dueDate).toBe('2025-06-01');
    });

    test('tidak mengubah todo lain', () => {
      const state = stateWithTodos([base, other]);
      const next = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: { id: 'id-1', data: { title: 'X', priority: 'Sedang', category: null, dueDate: null } },
      });
      expect(next.todos.find((t) => t.id === 'id-2')).toEqual(other);
    });

    test('jumlah todo tidak berubah', () => {
      const state = stateWithTodos([base, other]);
      const next = todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: { id: 'id-1', data: { title: 'X', priority: 'Sedang', category: null, dueDate: null } },
      });
      expect(next.todos).toHaveLength(2);
    });
  });

  // ── DELETE_TODO ─────────────────────────────────────────────────────────────
  describe('DELETE_TODO', () => {
    const t1: Todo = { id: 'del-1', title: 'A', status: 'Belum Selesai', priority: 'Rendah', category: null, dueDate: null, createdAt: '' };
    const t2: Todo = { id: 'del-2', title: 'B', status: 'Selesai', priority: 'Tinggi', category: null, dueDate: null, createdAt: '' };

    test('menghapus todo dengan id yang sesuai', () => {
      const next = todoReducer(stateWithTodos([t1, t2]), { type: 'DELETE_TODO', payload: 'del-1' });
      expect(next.todos.find((t) => t.id === 'del-1')).toBeUndefined();
    });

    test('mempertahankan todo lain', () => {
      const next = todoReducer(stateWithTodos([t1, t2]), { type: 'DELETE_TODO', payload: 'del-1' });
      expect(next.todos).toHaveLength(1);
      expect(next.todos[0]).toEqual(t2);
    });

    test('tidak berpengaruh jika id tidak ditemukan', () => {
      const next = todoReducer(stateWithTodos([t1, t2]), { type: 'DELETE_TODO', payload: 'tidak-ada' });
      expect(next.todos).toHaveLength(2);
    });
  });

  // ── TOGGLE_TODO ─────────────────────────────────────────────────────────────
  describe('TOGGLE_TODO', () => {
    const belum: Todo = { id: 'tog-1', title: 'X', status: 'Belum Selesai', priority: 'Sedang', category: null, dueDate: null, createdAt: '' };
    const selesai: Todo = { id: 'tog-2', title: 'Y', status: 'Selesai', priority: 'Sedang', category: null, dueDate: null, createdAt: '' };

    test('"Belum Selesai" → "Selesai"', () => {
      const next = todoReducer(stateWithTodos([belum]), { type: 'TOGGLE_TODO', payload: 'tog-1' });
      expect(next.todos[0].status).toBe('Selesai');
    });

    test('"Selesai" → "Belum Selesai"', () => {
      const next = todoReducer(stateWithTodos([selesai]), { type: 'TOGGLE_TODO', payload: 'tog-2' });
      expect(next.todos[0].status).toBe('Belum Selesai');
    });

    test('tidak mengubah todo lain', () => {
      const next = todoReducer(stateWithTodos([belum, selesai]), { type: 'TOGGLE_TODO', payload: 'tog-1' });
      expect(next.todos.find((t) => t.id === 'tog-2')!.status).toBe('Selesai');
    });
  });

  // ── DELETE_COMPLETED ────────────────────────────────────────────────────────
  describe('DELETE_COMPLETED', () => {
    const a: Todo = { id: 'dc-1', title: 'A', status: 'Belum Selesai', priority: 'Rendah', category: null, dueDate: null, createdAt: '' };
    const b: Todo = { id: 'dc-2', title: 'B', status: 'Selesai', priority: 'Sedang', category: null, dueDate: null, createdAt: '' };
    const c: Todo = { id: 'dc-3', title: 'C', status: 'Selesai', priority: 'Tinggi', category: null, dueDate: null, createdAt: '' };

    test('hanya menghapus todo berstatus "Selesai"', () => {
      const next = todoReducer(stateWithTodos([a, b, c]), { type: 'DELETE_COMPLETED' });
      expect(next.todos.every((t) => t.status !== 'Selesai')).toBe(true);
    });

    test('mempertahankan todo "Belum Selesai"', () => {
      const next = todoReducer(stateWithTodos([a, b, c]), { type: 'DELETE_COMPLETED' });
      expect(next.todos).toHaveLength(1);
      expect(next.todos[0]).toEqual(a);
    });

    test('tidak berpengaruh jika tidak ada todo selesai', () => {
      const next = todoReducer(stateWithTodos([a]), { type: 'DELETE_COMPLETED' });
      expect(next.todos).toHaveLength(1);
    });

    test('menghasilkan list kosong jika semua selesai', () => {
      const next = todoReducer(stateWithTodos([b, c]), { type: 'DELETE_COMPLETED' });
      expect(next.todos).toHaveLength(0);
    });
  });

  // ── ADD_CATEGORY ────────────────────────────────────────────────────────────
  describe('ADD_CATEGORY', () => {
    test('menambahkan kategori dengan nama yang diberikan', () => {
      const next = todoReducer(initialState, { type: 'ADD_CATEGORY', payload: 'Kerja' });
      expect(next.categories).toHaveLength(1);
      expect(next.categories[0].name).toBe('Kerja');
    });

    test('menghasilkan id unik untuk kategori', () => {
      const s1 = todoReducer(initialState, { type: 'ADD_CATEGORY', payload: 'A' });
      const s2 = todoReducer(s1, { type: 'ADD_CATEGORY', payload: 'B' });
      expect(s2.categories[0].id).not.toBe(s2.categories[1].id);
    });
  });

  // ── DELETE_CATEGORY ─────────────────────────────────────────────────────────
  describe('DELETE_CATEGORY', () => {
    test('menghapus kategori berdasarkan nama', () => {
      const s = todoReducer(initialState, { type: 'ADD_CATEGORY', payload: 'Rumah' });
      const next = todoReducer(s, { type: 'DELETE_CATEGORY', payload: 'Rumah' });
      expect(next.categories).toHaveLength(0);
    });

    test('tidak menghapus kategori lain', () => {
      let s = todoReducer(initialState, { type: 'ADD_CATEGORY', payload: 'Rumah' });
      s = todoReducer(s, { type: 'ADD_CATEGORY', payload: 'Kerja' });
      const next = todoReducer(s, { type: 'DELETE_CATEGORY', payload: 'Rumah' });
      expect(next.categories).toHaveLength(1);
      expect(next.categories[0].name).toBe('Kerja');
    });
  });

  // ── SET_FILTER ──────────────────────────────────────────────────────────────
  describe('SET_FILTER', () => {
    test('menggabungkan partial filter ke state filter', () => {
      const next = todoReducer(initialState, { type: 'SET_FILTER', payload: { status: 'Selesai' } });
      expect(next.filter.status).toBe('Selesai');
      expect(next.filter.priority).toBe('Semua'); // tidak berubah
    });

    test('dapat mengubah beberapa field sekaligus', () => {
      const next = todoReducer(initialState, { type: 'SET_FILTER', payload: { status: 'Belum Selesai', search: 'beli' } });
      expect(next.filter.status).toBe('Belum Selesai');
      expect(next.filter.search).toBe('beli');
    });
  });

  // ── SET_SORT ────────────────────────────────────────────────────────────────
  describe('SET_SORT', () => {
    test('menyetel state sort', () => {
      const next = todoReducer(initialState, { type: 'SET_SORT', payload: { field: 'dueDate', direction: 'asc' } });
      expect(next.sort).toEqual({ field: 'dueDate', direction: 'asc' });
    });

    test('mengganti sort sebelumnya', () => {
      const s1 = todoReducer(initialState, { type: 'SET_SORT', payload: { field: 'priority', direction: 'desc' } });
      const s2 = todoReducer(s1, { type: 'SET_SORT', payload: { field: 'createdAt', direction: 'asc' } });
      expect(s2.sort).toEqual({ field: 'createdAt', direction: 'asc' });
    });
  });

  // ── RESET_FILTER ────────────────────────────────────────────────────────────
  describe('RESET_FILTER', () => {
    test('mengembalikan filter ke nilai awal', () => {
      const modified = todoReducer(initialState, { type: 'SET_FILTER', payload: { status: 'Selesai', search: 'abc', priority: 'Tinggi' } });
      const next = todoReducer(modified, { type: 'RESET_FILTER' });
      expect(next.filter).toEqual(initialState.filter);
    });
  });

  // ── LOAD_STATE ──────────────────────────────────────────────────────────────
  describe('LOAD_STATE', () => {
    test('menggabungkan partial state', () => {
      const todos: Todo[] = [
        { id: 'ls-1', title: 'Loaded', status: 'Selesai', priority: 'Rendah', category: null, dueDate: null, createdAt: '' },
      ];
      const next = todoReducer(initialState, { type: 'LOAD_STATE', payload: { todos } });
      expect(next.todos).toEqual(todos);
      expect(next.filter).toEqual(initialState.filter); // tidak berubah
    });

    test('dapat memuat todos dan categories sekaligus', () => {
      const todos: Todo[] = [{ id: 'ls-2', title: 'T', status: 'Belum Selesai', priority: 'Sedang', category: null, dueDate: null, createdAt: '' }];
      const categories = [{ id: 'cat-1', name: 'Kerja' }];
      const next = todoReducer(initialState, { type: 'LOAD_STATE', payload: { todos, categories } });
      expect(next.todos).toEqual(todos);
      expect(next.categories).toEqual(categories);
    });
  });

  // ── SHOW_NOTIFICATION ───────────────────────────────────────────────────────
  describe('SHOW_NOTIFICATION', () => {
    test('menyetel notification di state', () => {
      const notif = { id: 'n1', message: 'Berhasil!', type: 'success' as const };
      const next = todoReducer(initialState, { type: 'SHOW_NOTIFICATION', payload: notif });
      expect(next.notification).toEqual(notif);
    });

    test('mengganti notification sebelumnya', () => {
      const n1 = { id: 'n1', message: 'Pertama', type: 'success' as const };
      const n2 = { id: 'n2', message: 'Kedua', type: 'error' as const };
      const s1 = todoReducer(initialState, { type: 'SHOW_NOTIFICATION', payload: n1 });
      const s2 = todoReducer(s1, { type: 'SHOW_NOTIFICATION', payload: n2 });
      expect(s2.notification).toEqual(n2);
    });
  });

  // ── HIDE_NOTIFICATION ───────────────────────────────────────────────────────
  describe('HIDE_NOTIFICATION', () => {
    test('menghapus notification (set ke null)', () => {
      const notif = { id: 'n1', message: 'Pesan', type: 'warning' as const };
      const s1 = todoReducer(initialState, { type: 'SHOW_NOTIFICATION', payload: notif });
      const next = todoReducer(s1, { type: 'HIDE_NOTIFICATION' });
      expect(next.notification).toBeNull();
    });

    test('tidak berpengaruh jika notification sudah null', () => {
      const next = todoReducer(initialState, { type: 'HIDE_NOTIFICATION' });
      expect(next.notification).toBeNull();
    });
  });
});
