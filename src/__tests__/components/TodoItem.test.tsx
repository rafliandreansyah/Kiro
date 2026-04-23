import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import fc from 'fast-check';
import TodoItem from '../../components/TodoItem';
import type { Todo } from '../../types/index';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const validTitleArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

const todoArb = fc.record<Todo>({
  id: fc.uuid(),
  title: validTitleArb,
  status: fc.constantFrom('Belum Selesai' as const, 'Selesai' as const),
  priority: fc.constantFrom('Rendah' as const, 'Sedang' as const, 'Tinggi' as const),
  category: fc.option(
    fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    { nil: null }
  ),
  dueDate: fc.option(
    fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map((d) => d.toISOString().split('T')[0]),
    { nil: null }
  ),
  createdAt: fc.date().map((d) => d.toISOString()),
});

// Todo that is always "Belum Selesai"
const incompleteTodoArb = todoArb.map((t) => ({ ...t, status: 'Belum Selesai' as const }));

// Todo with a past dueDate and "Belum Selesai"
const overdueTodoArb = incompleteTodoArb.map((t) => ({
  ...t,
  dueDate: '2000-01-01', // always in the past
}));

// Todo with a future dueDate and "Belum Selesai"
const notOverdueTodoArb = incompleteTodoArb.map((t) => ({
  ...t,
  dueDate: '2099-12-31', // always in the future
}));

// Todo that is "Selesai" with a past dueDate
const donePastDueTodoArb = todoArb.map((t) => ({
  ...t,
  status: 'Selesai' as const,
  dueDate: '2000-01-01',
}));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Property 4: TodoItem Menampilkan Semua Atribut
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------
describe('TodoItem - Property 4: TodoItem Menampilkan Semua Atribut', () => {
  test('judul, priority, kategori, dan due date dirender', () => {
    fc.assert(
      fc.property(todoArb, (todo) => {
        cleanup();

        render(
          <TodoItem
            todo={todo}
            categories={[]}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );

        // Judul harus ada di DOM — use trim() to handle whitespace normalization
        const titleEl = screen.getByText((content) => content.trim() === todo.title.trim());
        expect(titleEl).toBeTruthy();

        // Priority badge harus ada
        expect(screen.getByText(todo.priority)).toBeTruthy();

        // Kategori harus ada jika tidak null — gunakan aria-label untuk lookup yang andal
        if (todo.category) {
          expect(screen.getByLabelText((label) => label.startsWith('Kategori:'))).toBeTruthy();
        }

        // Due date harus ada jika tidak null — gunakan aria-label untuk lookup yang andal
        if (todo.dueDate) {
          expect(screen.getByLabelText(`Tanggal jatuh tempo: ${todo.dueDate}`)).toBeTruthy();
        }

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Indikator "Terlambat" Muncul Tepat
// Validates: Requirements 2.5
// ---------------------------------------------------------------------------
describe('TodoItem - Property 6: Indikator "Terlambat" Muncul Tepat', () => {
  test('indikator Terlambat muncul saat dueDate lewat dan status Belum Selesai', () => {
    fc.assert(
      fc.property(overdueTodoArb, (todo) => {
        cleanup();

        render(
          <TodoItem
            todo={todo}
            categories={[]}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );

        expect(screen.getByText('Terlambat')).toBeTruthy();

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('indikator Terlambat tidak muncul saat dueDate belum lewat', () => {
    fc.assert(
      fc.property(notOverdueTodoArb, (todo) => {
        cleanup();

        render(
          <TodoItem
            todo={todo}
            categories={[]}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );

        expect(screen.queryByText('Terlambat')).toBeNull();

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('indikator Terlambat tidak muncul saat status Selesai meski dueDate lewat', () => {
    fc.assert(
      fc.property(donePastDueTodoArb, (todo) => {
        cleanup();

        render(
          <TodoItem
            todo={todo}
            categories={[]}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );

        expect(screen.queryByText('Terlambat')).toBeNull();

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13: Batal Hapus Mempertahankan Todo
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------
describe('TodoItem - Property 13: Batal Hapus Mempertahankan Todo', () => {
  test('klik Batal pada dialog konfirmasi tidak memanggil onDelete', () => {
    fc.assert(
      fc.property(todoArb, (todo) => {
        cleanup();

        const onDelete = vi.fn();

        render(
          <TodoItem
            todo={todo}
            categories={[]}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={onDelete}
          />
        );

        // Klik tombol Hapus untuk membuka dialog
        const deleteButton = screen.getByRole('button', { name: /hapus/i });
        act(() => {
          fireEvent.click(deleteButton);
        });

        // Dialog konfirmasi harus muncul
        expect(screen.getByRole('dialog')).toBeTruthy();

        // Klik Batal
        const cancelButton = screen.getByRole('button', { name: /^batal$/i });
        act(() => {
          fireEvent.click(cancelButton);
        });

        // onDelete tidak boleh dipanggil
        expect(onDelete).not.toHaveBeenCalled();

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------
describe('TodoItem - Unit Tests', () => {
  const baseTodo: Todo = {
    id: 'test-id-1',
    title: 'Belajar React',
    status: 'Belum Selesai',
    priority: 'Sedang',
    category: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
  };

  test('menampilkan checkbox', () => {
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  test('menampilkan tombol Edit', () => {
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy();
  });

  test('menampilkan tombol Hapus', () => {
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /hapus/i })).toBeTruthy();
  });

  test('judul memiliki strikethrough saat status Selesai', () => {
    const doneTodo: Todo = { ...baseTodo, status: 'Selesai' };
    render(
      <TodoItem
        todo={doneTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const titleEl = screen.getByText(doneTodo.title);
    expect(titleEl.className).toMatch(/line-through/);
  });

  test('judul tidak memiliki strikethrough saat status Belum Selesai', () => {
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const titleEl = screen.getByText(baseTodo.title);
    expect(titleEl.className).not.toMatch(/line-through/);
  });

  test('indikator Terlambat tidak muncul pada todo Selesai meski dueDate lewat', () => {
    const donePastDue: Todo = {
      ...baseTodo,
      status: 'Selesai',
      dueDate: '2000-01-01',
    };
    render(
      <TodoItem
        todo={donePastDue}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('Terlambat')).toBeNull();
  });

  test('indikator Terlambat muncul pada todo Belum Selesai dengan dueDate lewat', () => {
    const overdueTodo: Todo = {
      ...baseTodo,
      status: 'Belum Selesai',
      dueDate: '2000-01-01',
    };
    render(
      <TodoItem
        todo={overdueTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Terlambat')).toBeTruthy();
  });

  test('klik tombol Edit menampilkan form edit', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('form', { name: /form edit tugas/i })).toBeTruthy();
  });

  test('klik tombol Hapus membuka dialog konfirmasi', async () => {
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /hapus/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('konfirmasi hapus memanggil onDelete dengan id yang benar', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: /hapus/i }));
    await user.click(screen.getByRole('button', { name: /ya/i }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(baseTodo.id);
  });

  test('checkbox memanggil onToggle dengan id yang benar', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith(baseTodo.id);
  });

  test('simpan dari form edit memanggil onEdit dan menutup form', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    // Form edit terbuka — klik Simpan (aria-label="Simpan perubahan tugas")
    await user.click(screen.getByRole('button', { name: /simpan perubahan tugas/i }));

    expect(onEdit).toHaveBeenCalledOnce();
    // Setelah simpan, form edit harus tertutup
    expect(screen.queryByRole('form', { name: /form edit tugas/i })).toBeNull();
  });
});
