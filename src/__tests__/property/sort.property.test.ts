import fc from 'fast-check';
import { sortTodos } from '../../utils/todoUtils';
import type { Todo, SortState } from '../../types/index';

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

const sortStateArb = fc.record({
  field: fc.constantFrom('createdAt' as const, 'dueDate' as const, 'priority' as const),
  direction: fc.constantFrom('asc' as const, 'desc' as const),
});

const PRIORITY_MAP: Record<'Rendah' | 'Sedang' | 'Tinggi', number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

// Helper: cek apakah pasangan (a, b) memenuhi relasi urutan sesuai sort state
function isCorrectOrder(a: Todo, b: Todo, sort: SortState): boolean {
  const { field, direction } = sort;

  if (field === 'createdAt') {
    const cmp = a.createdAt.localeCompare(b.createdAt);
    return direction === 'asc' ? cmp <= 0 : cmp >= 0;
  }

  if (field === 'dueDate') {
    // Nulls always go last regardless of direction
    if (a.dueDate === null && b.dueDate === null) return true;
    if (a.dueDate === null) return false; // a (null) should not come before b (non-null)
    if (b.dueDate === null) return true;  // a (non-null) correctly comes before b (null)
    const cmp = a.dueDate.localeCompare(b.dueDate);
    return direction === 'asc' ? cmp <= 0 : cmp >= 0;
  }

  if (field === 'priority') {
    const diff = PRIORITY_MAP[a.priority] - PRIORITY_MAP[b.priority];
    return direction === 'asc' ? diff <= 0 : diff >= 0;
  }

  return true;
}

// Feature: todo-list-app, Property 16: Pengurutan Menghasilkan Urutan yang Benar
// Validates: Requirements 7.2
test('setiap pasangan berurutan dalam hasil sortTodos harus memenuhi relasi urutan yang benar', () => {
  fc.assert(
    fc.property(fc.array(todoArb, { minLength: 0, maxLength: 20 }), sortStateArb, (todos, sort) => {
      const result = sortTodos(todos, sort);

      // Periksa setiap pasangan berurutan (a, b) dalam hasil
      for (let i = 0; i < result.length - 1; i++) {
        const a = result[i];
        const b = result[i + 1];
        if (!isCorrectOrder(a, b, sort)) {
          return false;
        }
      }

      return true;
    }),
    { numRuns: 100 }
  );
});
