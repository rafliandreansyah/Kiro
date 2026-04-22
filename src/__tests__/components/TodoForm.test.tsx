import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import fc from 'fast-check';
import TodoForm from '../../components/TodoForm';

// Generator untuk judul todo yang valid (non-empty, ≤200 karakter)
// Filter karakter khusus yang diinterpretasikan oleh userEvent ({, })
const validTodoTitleArb = fc.string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0)
  .filter(s => !s.includes('{') && !s.includes('}') && !s.includes('[') && !s.includes(']'));

afterEach(() => {
  cleanup();
});

// Feature: todo-list-app, Property 2: Input Field Dikosongkan Setelah Penambahan
// Validates: Requirements 1.3
describe('TodoForm - Property 2: Input Field Dikosongkan Setelah Penambahan', () => {
  test('setelah submit valid, input judul harus kosong', async () => {
    await fc.assert(
      fc.asyncProperty(validTodoTitleArb, async (title) => {
        cleanup();

        const onSubmit = vi.fn();
        const user = userEvent.setup();

        render(<TodoForm onSubmit={onSubmit} categories={[]} />);

        const titleInput = screen.getByLabelText('Judul tugas') as HTMLInputElement;

        // Isi input judul via fireEvent untuk menghindari interpretasi karakter khusus
        fireEvent.change(titleInput, { target: { value: title } });
        expect(titleInput.value).toBe(title);

        // Submit form via tombol "Tambah"
        const submitButton = screen.getByRole('button', { name: /tambah/i });
        await user.click(submitButton);

        // onSubmit harus dipanggil
        expect(onSubmit).toHaveBeenCalledTimes(1);

        // Input judul harus kosong setelah submit berhasil
        expect(titleInput.value).toBe('');

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// Unit tests untuk TodoForm
describe('TodoForm - Unit Tests', () => {
  afterEach(() => {
    cleanup();
  });

  test('default priority adalah "Sedang"', () => {
    render(<TodoForm onSubmit={vi.fn()} categories={[]} />);
    const prioritySelect = screen.getByLabelText('Prioritas tugas') as HTMLSelectElement;
    expect(prioritySelect.value).toBe('Sedang');
  });

  test('submit dengan judul kosong menampilkan pesan error', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} categories={[]} />);

    const submitButton = screen.getByRole('button', { name: /tambah/i });
    await user.click(submitButton);

    expect(screen.getByRole('alert')).toHaveTextContent('Judul tugas tidak boleh kosong');
  });

  test('submit valid memanggil onSubmit dengan data yang benar dan mengosongkan field', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TodoForm onSubmit={onSubmit} categories={[]} />);

    const titleInput = screen.getByLabelText('Judul tugas') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Belajar TypeScript' } });

    const submitButton = screen.getByRole('button', { name: /tambah/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Belajar TypeScript',
      priority: 'Sedang',
      category: null,
      dueDate: null,
    });

    expect(titleInput.value).toBe('');
  });
});
