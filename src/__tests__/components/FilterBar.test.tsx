import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import FilterBar from '../../components/FilterBar';
import { Category, FilterState } from '../../types';

const defaultFilter: FilterState = {
  status: 'Semua',
  priority: 'Semua',
  category: null,
  search: '',
};

const categories: Category[] = [
  { id: '1', name: 'Kerja' },
  { id: '2', name: 'Pribadi' },
];

afterEach(() => {
  cleanup();
});

describe('FilterBar - Unit Tests', () => {
  test('menampilkan nilai filter status dari props', () => {
    render(
      <FilterBar
        filter={{ ...defaultFilter, status: 'Selesai' }}
        categories={categories}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const statusSelect = screen.getByLabelText('Filter berdasarkan status') as HTMLSelectElement;
    expect(statusSelect.value).toBe('Selesai');
  });

  test('menampilkan nilai filter priority dari props', () => {
    render(
      <FilterBar
        filter={{ ...defaultFilter, priority: 'Tinggi' }}
        categories={categories}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const prioritySelect = screen.getByLabelText('Filter berdasarkan prioritas') as HTMLSelectElement;
    expect(prioritySelect.value).toBe('Tinggi');
  });

  test('menampilkan nilai filter kategori dari props', () => {
    render(
      <FilterBar
        filter={{ ...defaultFilter, category: 'Kerja' }}
        categories={categories}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const categorySelect = screen.getByLabelText('Filter berdasarkan kategori') as HTMLSelectElement;
    expect(categorySelect.value).toBe('Kerja');
  });

  test('menampilkan nilai search dari props', () => {
    render(
      <FilterBar
        filter={{ ...defaultFilter, search: 'belajar' }}
        categories={categories}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    const searchInput = screen.getByLabelText('Cari tugas berdasarkan judul') as HTMLInputElement;
    expect(searchInput.value).toBe('belajar');
  });

  test('menampilkan semua opsi kategori dari props', () => {
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByRole('option', { name: 'Kerja' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pribadi' })).toBeInTheDocument();
  });

  test('perubahan dropdown status memanggil onChange dengan status baru', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );
    const statusSelect = screen.getByLabelText('Filter berdasarkan status');
    await user.selectOptions(statusSelect, 'Belum Selesai');
    expect(onChange).toHaveBeenCalledWith({ status: 'Belum Selesai' });
  });

  test('perubahan dropdown priority memanggil onChange dengan priority baru', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );
    const prioritySelect = screen.getByLabelText('Filter berdasarkan prioritas');
    await user.selectOptions(prioritySelect, 'Rendah');
    expect(onChange).toHaveBeenCalledWith({ priority: 'Rendah' });
  });

  test('perubahan dropdown kategori memanggil onChange dengan kategori baru', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );
    const categorySelect = screen.getByLabelText('Filter berdasarkan kategori');
    await user.selectOptions(categorySelect, 'Pribadi');
    expect(onChange).toHaveBeenCalledWith({ category: 'Pribadi' });
  });

  test('perubahan dropdown kategori ke "Semua" memanggil onChange dengan category: null', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={{ ...defaultFilter, category: 'Kerja' }}
        categories={categories}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );
    const categorySelect = screen.getByLabelText('Filter berdasarkan kategori');
    await user.selectOptions(categorySelect, '');
    expect(onChange).toHaveBeenCalledWith({ category: null });
  });

  test('perubahan input search memanggil onChange dengan search baru', () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );
    const searchInput = screen.getByLabelText('Cari tugas berdasarkan judul');
    fireEvent.change(searchInput, { target: { value: 'tugas baru' } });
    expect(onChange).toHaveBeenCalledWith({ search: 'tugas baru' });
  });

  test('tombol "Reset Filter" memanggil onReset', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar
        filter={defaultFilter}
        categories={categories}
        onChange={vi.fn()}
        onReset={onReset}
      />
    );
    const resetButton = screen.getByRole('button', { name: /reset semua filter/i });
    await user.click(resetButton);
    expect(onReset).toHaveBeenCalledOnce();
  });
});
