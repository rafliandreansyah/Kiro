import { render, screen } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import fc from 'fast-check';
import NotificationToast from '../../components/NotificationToast';
import type { Notification } from '../../types/index';

// Arbitrary untuk tipe notifikasi
const notificationTypeArb = fc.constantFrom('success', 'error', 'warning') as fc.Arbitrary<Notification['type']>;

// Arbitrary untuk pesan notifikasi yang valid (trim agar tidak ada whitespace-only)
const notificationMessageArb = fc.string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim());

// Arbitrary untuk objek Notification
const notificationArb: fc.Arbitrary<Notification> = fc.record({
  id: fc.uuid(),
  message: notificationMessageArb,
  type: notificationTypeArb,
});

afterEach(() => {
  cleanup();
});

// Feature: todo-list-app, Property 22: Notifikasi Muncul dan Hilang Setelah 3 Detik
// Validates: Requirements 10.4
describe('NotificationToast - Property 22: Notifikasi Muncul dan Hilang Setelah 3 Detik', () => {
  test('ketika notification diberikan, pesan ditampilkan dan onDismiss dipanggil setelah 3 detik', () => {
    fc.assert(
      fc.property(notificationArb, (notification) => {
        cleanup();
        vi.useFakeTimers();

        const onDismiss = vi.fn();

        render(
          <NotificationToast notification={notification} onDismiss={onDismiss} />
        );

        // Notifikasi harus muncul dengan role alert
        const alertEl = screen.getByRole('alert');
        expect(alertEl).toBeInTheDocument();

        // Pesan harus ada di dalam elemen alert
        expect(alertEl.textContent).toBe(notification.message);

        // onDismiss belum dipanggil sebelum 3 detik
        expect(onDismiss).not.toHaveBeenCalled();

        // Maju waktu 3 detik
        vi.advanceTimersByTime(3000);

        // onDismiss harus dipanggil tepat sekali setelah 3 detik
        expect(onDismiss).toHaveBeenCalledTimes(1);

        vi.useRealTimers();
        cleanup();

        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('ketika notification adalah null, tidak ada yang dirender', () => {
    fc.assert(
      fc.property(fc.constant(null), (_notification) => {
        cleanup();

        const onDismiss = vi.fn();

        const { container } = render(
          <NotificationToast notification={null} onDismiss={onDismiss} />
        );

        // Tidak ada elemen yang dirender
        expect(container.firstChild).toBeNull();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();

        cleanup();
        return true;
      }),
      { numRuns: 10 }
    );
  });
});
