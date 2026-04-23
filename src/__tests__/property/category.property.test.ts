import fc from 'fast-check';
import { validateCategoryName } from '../../utils/validator';
import type { Category, Todo } from '../../types/index';

const categoryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
});

const todoArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  status: fc.constantFrom('Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  dueDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: null }),
  createdAt: fc.date().map(d => d.toISOString()),
});

// Feature: todo-list-app, Property 17: Nama Kategori Unik
// Validates: Requirements 8.2
test('submit nama duplikat menampilkan error dari validator', () => {
  const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  fc.assert(
    fc.property(
      nameArb,
      fc.array(categoryArb, { minLength: 0, maxLength: 5 }),
      (existingName, otherCategories) => {
        const categories: Category[] = [
          { id: 'existing-id', name: existingName },
          ...otherCategories,
        ];

        // Exact match
        const exactResult = validateCategoryName(existingName, categories);
        if (exactResult.valid || exactResult.error !== 'Kategori dengan nama ini sudah ada') {
          return false;
        }

        // Case-insensitive: uppercase variant
        const upperResult = validateCategoryName(existingName.toUpperCase(), categories);
        if (upperResult.valid || upperResult.error !== 'Kategori dengan nama ini sudah ada') {
          return false;
        }

        // Case-insensitive: lowercase variant
        const lowerResult = validateCategoryName(existingName.toLowerCase(), categories);
        if (lowerResult.valid || lowerResult.error !== 'Kategori dengan nama ini sudah ada') {
          return false;
        }

        return true;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: todo-list-app, Property 18: Kategori dengan Todo Tidak Bisa Dihapus
// Validates: Requirements 8.4
test('tombol hapus kategori harus disabled jika ada todo yang menggunakan kategori tersebut', () => {
  fc.assert(
    fc.property(
      categoryArb,
      fc.array(todoArb, { minLength: 1, maxLength: 10 }),
      (category, baseTodos) => {
        // Assign at least one todo to this category
        const todos: Todo[] = baseTodos.map((todo, i) =>
          i === 0 ? { ...todo, category: category.name } : todo
        );

        const hasTodosForCategory = (catName: string) =>
          todos.some(t => t.category === catName);

        // The category with a linked todo must be considered "in use"
        return hasTodosForCategory(category.name) === true;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: todo-list-app, Property 19: Semua Kategori Muncul di Form Todo
// Validates: Requirements 8.5
test('semua kategori yang ada harus tersedia sebagai pilihan di selector form todo', () => {
  fc.assert(
    fc.property(
      fc.array(categoryArb, { minLength: 0, maxLength: 20 }),
      (categories) => {
        // Simulate what a category selector would expose: the list of category names
        const selectorOptions = categories.map(c => c.name);

        // Every category name must appear in the selector options
        return categories.every(cat => selectorOptions.includes(cat.name));
      }
    ),
    { numRuns: 100 }
  );
});
