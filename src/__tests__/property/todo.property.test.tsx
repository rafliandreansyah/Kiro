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

// ─── Integration tests ────────────────────────────────────────────────────────
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../App';

// Mock localStorage for all integration tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  localStorageMock.clear();
});

// Feature: todo-list-app, Property 1: Penambahan Todo Menghasilkan Todo di List
// Validates: Requirements 1.2, 2.1, 3.2, 5.3
test('alur utama: tambah todo → muncul di list → toggle → status berubah → hapus → hilang dari list', async () => {
  const { unmount } = render(<App />);

  // 1. Tambah todo
  const titleInput = screen.getByLabelText('Judul tugas');
  fireEvent.change(titleInput, { target: { value: 'Tugas Integrasi Test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tambah tugas' }));

  // 2. Todo muncul di list
  const todoItem = await screen.findByText('Tugas Integrasi Test');
  expect(todoItem).toBeInTheDocument();

  // 3. Toggle todo → status berubah ke Selesai (strikethrough)
  const checkbox = screen.getByRole('checkbox', { name: /Tandai tugas "Tugas Integrasi Test"/ });
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  expect(todoItem).toHaveClass('line-through');

  // 4. Hapus todo → konfirmasi → hilang dari list
  const deleteBtn = screen.getByRole('button', { name: /Hapus tugas "Tugas Integrasi Test"/ });
  fireEvent.click(deleteBtn);

  const confirmDialog = screen.getByRole('dialog');
  const confirmBtn = within(confirmDialog).getByRole('button', { name: 'Ya, konfirmasi' });
  fireEvent.click(confirmBtn);

  expect(screen.queryByText('Tugas Integrasi Test')).not.toBeInTheDocument();

  unmount();
});
