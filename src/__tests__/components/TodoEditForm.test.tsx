import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import fc from 'fast-check';
import TodoEditForm from '../../components/TodoEditForm';
import type { Category, Todo } from '../../types/index';

// Generator untuk Todo yang valid
const todoArb = fc.record<Todo>({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  status: fc.constantFrom('Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0)
      .filter(s => !s.includes('\0')),
    { nil: null }
  ),
  dueDate: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map(d => d.toISOString().split('T')[0]),
    { nil: null }
  ),
  createdAt: fc.date().map(d => d.toISOString()),
});

afterEach(() => {
  cleanup();
});

// Feature: todo-list-app, Property 9: Form Edit Menampilkan Data Todo yang Benar
// Validates: Requirements 4.2
describe('TodoEditForm - Property 9: Form Edit Menampilkan Data Todo yang Benar', () => {
  test('semua field terisi sesuai data todo', () => {
    fc.assert(
      fc.property(todoArb, (todo) => {
        cleanup();

        // Buat categories yang menyertakan kategori todo agar select bisa menampilkan nilainya
        const categories: Category[] = todo.category
          ? [{ id: 'cat-1', name: todo.category }]
          : [];

        render(
          <TodoEditForm
            todo={todo}
            onSave={vi.fn()}
            onCancel={vi.fn()}
            categories={categories}
          />
        );

        // Judul harus terisi dengan nilai todo.title
        const titleInput = screen.getByLabelText('Judul tugas') as HTMLInputElement;
        expect(titleInput.value).toBe(todo.title);

        // Priority harus terisi dengan nilai todo.priority
        const prioritySelect = screen.getByLabelText('Prioritas tugas') as HTMLSelectElement;
        expect(prioritySelect.value).toBe(todo.priority);

        // Due date harus terisi dengan nilai todo.dueDate (atau kosong jika null)
        const dueDateInput = screen.getByLabelText('Tanggal jatuh tempo') as HTMLInputElement;
        expect(dueDateInput.value).toBe(todo.dueDate ?? '');

        // Category harus terisi dengan nilai todo.category (atau kosong jika null)
        const categorySelect = screen.getByLabelText('Kategori tugas') as HTMLSelectElement;
        expect(categorySelect.value).toBe(todo.category ?? '');

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-list-app, Property 11: Batal Edit Tidak Mengubah Todo
// Validates: Requirements 4.5
describe('TodoEditForm - Property 11: Batal Edit Tidak Mengubah Todo', () => {
  test('klik Batal memanggil onCancel dan tidak memanggil onSave', () => {
    fc.assert(
      fc.property(todoArb, (todo) => {
        cleanup();

        const onSave = vi.fn();
        const onCancel = vi.fn();

        const categories: Category[] = todo.category
          ? [{ id: 'cat-1', name: todo.category }]
          : [];

        render(
          <TodoEditForm
            todo={todo}
            onSave={onSave}
            onCancel={onCancel}
            categories={categories}
          />
        );

        // Ubah judul untuk memastikan perubahan tidak tersimpan
        const titleInput = screen.getByLabelText('Judul tugas') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: 'Judul yang diubah tapi dibatalkan' } });

        // Klik tombol Batal via fireEvent untuk keandalan di jsdom
        const cancelButton = screen.getByRole('button', { name: /batal/i });
        fireEvent.click(cancelButton);

        // onCancel harus dipanggil
        expect(onCancel).toHaveBeenCalledTimes(1);

        // onSave tidak boleh dipanggil
        expect(onSave).not.toHaveBeenCalled();

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
