import { render, screen } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import fc from 'fast-check';
import SummaryBar from '../../components/SummaryBar';
import type { Todo } from '../../types/index';

// Arbitrary untuk Todo sesuai design.md
const validTodoTitleArb = fc.string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0);

const todoArb: fc.Arbitrary<Todo> = fc.record({
  id: fc.uuid(),
  title: validTodoTitleArb,
  status: fc.constantFrom('Belum Selesai', 'Selesai') as fc.Arbitrary<Todo['status']>,
  priority: fc.constantFrom('Rendah', 'Sedang', 'Tinggi') as fc.Arbitrary<Todo['priority']>,
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  dueDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: null }),
  createdAt: fc.date().map(d => d.toISOString()),
});

afterEach(() => {
  cleanup();
});

// Feature: todo-list-app, Property 5: SummaryBar Menampilkan Hitungan yang Akurat
// Validates: Requirements 2.4
describe('SummaryBar - Property 5: SummaryBar Menampilkan Hitungan yang Akurat', () => {
  test('untuk sembarang array todos, SummaryBar menampilkan total, belum selesai, dan selesai yang akurat', () => {
    fc.assert(
      fc.property(fc.array(todoArb), (todos) => {
        cleanup();

        const expectedTotal = todos.length;
        const expectedBelumSelesai = todos.filter(t => t.status === 'Belum Selesai').length;
        const expectedSelesai = todos.filter(t => t.status === 'Selesai').length;

        const { container } = render(<SummaryBar todos={todos} />);

        // Verifikasi label teks
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('Belum Selesai')).toBeInTheDocument();
        expect(screen.getByText('Selesai')).toBeInTheDocument();

        // Ambil angka dari setiap section berdasarkan label sibling
        const totalLabel = screen.getByText('Total');
        const totalSection = totalLabel.parentElement!;
        const totalSpan = totalSection.querySelector('span:first-child')!;
        expect(totalSpan.textContent).toBe(String(expectedTotal));

        const belumSelesaiLabel = screen.getByText('Belum Selesai');
        const belumSelesaiSection = belumSelesaiLabel.parentElement!;
        const belumSelesaiSpan = belumSelesaiSection.querySelector('span:first-child')!;
        expect(belumSelesaiSpan.textContent).toBe(String(expectedBelumSelesai));

        const selesaiLabel = screen.getByText('Selesai');
        const selesaiSection = selesaiLabel.parentElement!;
        const selesaiSpan = selesaiSection.querySelector('span:first-child')!;
        expect(selesaiSpan.textContent).toBe(String(expectedSelesai));

        // Verifikasi konsistensi: total = belumSelesai + selesai
        expect(expectedTotal).toBe(expectedBelumSelesai + expectedSelesai);

        void container;

        cleanup();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
