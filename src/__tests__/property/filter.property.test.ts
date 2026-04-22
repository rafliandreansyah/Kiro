import fc from 'fast-check';
import { filterTodos } from '../../utils/todoUtils';
import type { Todo, FilterState } from '../../types/index';

// Arbitrary generator untuk Todo
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

const filterStateArb = fc.record({
  status: fc.constantFrom('Semua' as const, 'Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Semua' as const, 'Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(fc.string({ minLength: 1 }), { nil: null }),
  search: fc.string(),
});

// Helper: cek apakah satu todo memenuhi semua kriteria filter
function todoMatchesFilter(todo: Todo, filter: FilterState): boolean {
  if (filter.status !== 'Semua' && todo.status !== filter.status) return false;
  if (filter.priority !== 'Semua' && todo.priority !== filter.priority) return false;
  if (filter.category !== null && todo.category !== filter.category) return false;
  if (filter.search.trim() !== '') {
    const query = filter.search.trim().toLowerCase();
    if (!todo.title.toLowerCase().includes(query)) return false;
  }
  return true;
}

// Feature: todo-list-app, Property 14: Filter Kombinasi Menampilkan Todo yang Memenuhi Semua Kriteria
// Validates: Requirements 6.4, 6.7
test('semua todo yang dikembalikan harus memenuhi semua kriteria filter, dan tidak ada yang terlewat', () => {
  fc.assert(
    fc.property(fc.array(todoArb, { minLength: 0, maxLength: 20 }), filterStateArb, (todos, filter) => {
      const result = filterTodos(todos, filter);

      // Semua todo dalam hasil harus memenuhi semua kriteria filter
      const allResultsMatch = result.every(todo => todoMatchesFilter(todo, filter));

      // Semua todo yang memenuhi kriteria harus ada dalam hasil
      const expectedIds = new Set(todos.filter(t => todoMatchesFilter(t, filter)).map(t => t.id));
      const resultIds = new Set(result.map(t => t.id));
      const noMissing = [...expectedIds].every(id => resultIds.has(id));

      return allResultsMatch && noMissing;
    }),
    { numRuns: 100 }
  );
});

// Feature: todo-list-app, Property 15: Pencarian Case-Insensitive
// Validates: Requirements 6.6
test('pencarian harus case-insensitive: semua todo dengan judul yang cocok harus ditampilkan dan tidak ada yang tidak cocok', () => {
  fc.assert(
    fc.property(fc.array(todoArb, { minLength: 0, maxLength: 20 }), fc.string(), (todos, search) => {
      const filter: FilterState = {
        status: 'Semua',
        priority: 'Semua',
        category: null,
        search,
      };

      const result = filterTodos(todos, filter);
      const query = search.trim().toLowerCase();

      if (query === '') {
        // Tanpa query, semua todo harus dikembalikan
        return result.length === todos.length;
      }

      // Semua hasil harus mengandung query (case-insensitive)
      const allContainQuery = result.every(todo =>
        todo.title.toLowerCase().includes(query)
      );

      // Semua todo yang judulnya mengandung query harus ada dalam hasil
      const expectedIds = new Set(
        todos.filter(t => t.title.toLowerCase().includes(query)).map(t => t.id)
      );
      const resultIds = new Set(result.map(t => t.id));
      const noMissing = [...expectedIds].every(id => resultIds.has(id));

      return allContainQuery && noMissing;
    }),
    { numRuns: 100 }
  );
});
