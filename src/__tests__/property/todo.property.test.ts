import fc from 'fast-check';
import { validateTodoTitle, validateCategoryName } from '../../utils/validator';
import type { Category } from '../../types/index';

// Feature: todo-list-app, Property 3: Validasi Panjang Judul
// Validates: Requirements 1.5
test('judul dengan panjang lebih dari 200 karakter harus ditolak validator', () => {
  const tooLongTitleArb = fc.string({ minLength: 201, maxLength: 500 });

  fc.assert(
    fc.property(tooLongTitleArb, (title) => {
      const result = validateTodoTitle(title);
      return result.valid === false && result.error === 'Judul tugas maksimal 200 karakter';
    }),
    { numRuns: 100 }
  );
});

// Feature: todo-list-app, Property 17: Nama Kategori Unik
// Validates: Requirements 8.2
test('nama kategori yang sudah ada (case-insensitive) harus ditolak validator', () => {
  const categoryNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  const categoriesWithDuplicateArb = categoryNameArb.chain((existingName) => {
    const existingCategories = fc.array(
      fc.record({
        id: fc.uuid(),
        name: categoryNameArb,
      }),
      { minLength: 0, maxLength: 5 }
    ).map((cats): Category[] => [
      { id: 'fixed-id', name: existingName },
      ...cats,
    ]);

    // Generate a case-variant of the existing name as the duplicate
    const duplicateNameArb = fc.constantFrom(
      existingName,
      existingName.toLowerCase(),
      existingName.toUpperCase(),
    );

    return fc.tuple(existingCategories, duplicateNameArb);
  });

  fc.assert(
    fc.property(categoriesWithDuplicateArb, ([categories, duplicateName]) => {
      const result = validateCategoryName(duplicateName, categories);
      return result.valid === false && result.error === 'Kategori dengan nama ini sudah ada';
    }),
    { numRuns: 100 }
  );
});
