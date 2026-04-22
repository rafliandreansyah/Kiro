# Implementation Plan: Todo-List App

## Overview

Implementasi aplikasi Todo-List berbasis React + TypeScript + Tailwind CSS dengan state management menggunakan `useReducer` + Context API dan persistensi data via Local Storage. Pendekatan incremental: mulai dari fondasi data/logika, lalu komponen UI, kemudian integrasi penuh.

## Tasks

- [x] 1. Setup proyek dan struktur dasar
  - Inisialisasi proyek Vite + React + TypeScript
  - Install dependensi: Tailwind CSS, fast-check, Vitest, @testing-library/react
  - Konfigurasi Tailwind CSS (termasuk `darkMode: 'media'`)
  - Buat struktur folder: `src/types`, `src/context`, `src/services`, `src/utils`, `src/components`, `src/__tests__`
  - Definisikan semua TypeScript interfaces di `src/types/index.ts`: `Todo`, `Category`, `FilterState`, `SortState`, `TodoInput`, `Notification`, `AppState`, `PersistedState`
  - _Requirements: 1.1, 2.1, 9.1_

- [x] 2. Implementasi Validator dan StorageService
  - [x] 2.1 Implementasi modul `Validator` di `src/utils/validator.ts`
    - `validateTodoTitle(title)`: tolak kosong → "Judul tugas tidak boleh kosong", tolak >200 karakter → "Judul tugas maksimal 200 karakter"
    - `validateCategoryName(name, existing)`: tolak kosong, tolak duplikat case-insensitive → "Kategori dengan nama ini sudah ada"
    - _Requirements: 1.4, 1.5, 8.2_

  - [x] 2.2 Tulis property test untuk Validator
    - **Property 3: Validasi Panjang Judul** — gunakan `tooLongTitleArb` (minLength: 201)
    - **Property 17: Nama Kategori Unik** — gunakan arbitrary list kategori + nama duplikat
    - **Validates: Requirements 1.5, 8.2**
    - File: `src/__tests__/property/todo.property.test.ts`

  - [x] 2.3 Tulis unit test untuk Validator
    - Test judul kosong, judul tepat 200 karakter (valid), judul 201 karakter (invalid)
    - Test nama kategori kosong, duplikat exact-match, duplikat case-insensitive
    - File: `src/__tests__/unit/validator.test.ts`

  - [x] 2.4 Implementasi `StorageService` di `src/services/storageService.ts`
    - `isAvailable()`: cek ketersediaan Local Storage
    - `save(state)`: serialize `PersistedState` (todos + categories) ke JSON
    - `load()`: parse JSON dari Local Storage, return `null` jika tidak ada atau korup
    - Bungkus semua operasi dalam try-catch
    - _Requirements: 9.1, 9.3, 9.4_

  - [x] 2.5 Tulis property test untuk StorageService
    - **Property 20: Round-Trip Serialisasi Storage** — serialize lalu deserialize harus menghasilkan state identik
    - **Validates: Requirements 9.4, 9.5**
    - File: `src/__tests__/property/storage.property.test.ts`

  - [x] 2.6 Tulis unit test untuk StorageService
    - Test `load()` saat storage kosong, data valid, data korup
    - Test `save()` + `load()` round-trip
    - File: `src/__tests__/unit/storageService.test.ts`

                              - [x] 3. Implementasi Reducer dan AppContext
  - [x] 3.1 Implementasi `todoReducer` di `src/context/todoReducer.ts`
    - Handle semua action: `ADD_TODO`, `UPDATE_TODO`, `DELETE_TODO`, `TOGGLE_TODO`, `DELETE_COMPLETED`, `ADD_CATEGORY`, `DELETE_CATEGORY`, `SET_FILTER`, `SET_SORT`, `RESET_FILTER`, `LOAD_STATE`, `SHOW_NOTIFICATION`, `HIDE_NOTIFICATION`
    - `ADD_TODO`: generate UUID v4, set `createdAt` ke ISO string, status default "Belum Selesai"
    - `TOGGLE_TODO`: toggle antara "Belum Selesai" ↔ "Selesai"
    - _Requirements: 1.2, 3.2, 3.3, 4.3, 5.3, 5.5_

  - [x] 3.2 Tulis property test untuk reducer
    - **Property 7: Toggle Status adalah Round-Trip** — toggle dua kali harus kembali ke status semula
    - **Property 1: Penambahan Todo Menghasilkan Todo di List** — todo baru ada di list dengan status "Belum Selesai"
    - **Property 10: Simpan Edit Memperbarui Todo** — data lama tidak ada, data baru ada
    - **Property 12: Konfirmasi Hapus Menghilangkan Todo** — todo tidak ada di list setelah hapus
    - **Validates: Requirements 1.2, 3.2, 3.3, 4.3, 5.3**
    - File: `src/__tests__/unit/todoReducer.test.ts`

  - [x] 3.3 Tulis unit test untuk reducer
    - Test setiap action dengan state awal yang bervariasi
    - Test `DELETE_COMPLETED` hanya menghapus todo berstatus "Selesai"
    - File: `src/__tests__/unit/todoReducer.test.ts`

  - [x] 3.4 Implementasi `AppContext` di `src/context/AppContext.tsx`
    - Buat `AppContext` dengan `useReducer(todoReducer, initialState)`
    - Pada mount: panggil `StorageService.load()`, dispatch `LOAD_STATE`
    - Jika storage tidak tersedia, dispatch `SHOW_NOTIFICATION` dengan pesan peringatan
    - Subscribe ke perubahan state: setelah setiap dispatch, panggil `StorageService.save()`
    - Export `AppProvider` dan `useAppContext` hook
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 3.5 Tulis property test untuk persistensi
    - **Property 8: Persistensi Otomatis Setelah Operasi CRUD** — state di storage mencerminkan state terbaru
    - **Property 21: Reload Memuat Data dari Storage** — simulasi reload menghasilkan state identik
    - **Validates: Requirements 3.4, 4.6, 9.1, 9.2**
    - File: `src/__tests__/property/storage.property.test.ts`

- [x] 4. Checkpoint — Pastikan semua test logika inti lulus
  - Jalankan `vitest --run` dan pastikan semua test di `unit/` dan `property/` lulus
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum melanjutkan.

- [x] 5. Implementasi komponen utilitas dan dasar
  - [x] 5.1 Implementasi `ConfirmDialog` di `src/components/ConfirmDialog.tsx`
    - Props: `message`, `onConfirm`, `onCancel`
    - Modal overlay dengan tombol "Ya" dan "Batal"
    - _Requirements: 5.2, 5.4, 5.6_

  - [x] 5.2 Implementasi `NotificationToast` di `src/components/NotificationToast.tsx`
    - Props: `notification: Notification | null`
    - Tampilkan notifikasi, auto-dismiss setelah 3 detik via `useEffect`
    - Styling berbeda untuk `success`, `error`, `warning`
    - _Requirements: 10.4_

  - [x] 5.3 Tulis property test untuk NotificationToast
    - **Property 22: Notifikasi Muncul dan Hilang Setelah 3 Detik**
    - **Validates: Requirements 10.4**
    - File: `src/__tests__/components/NotificationToast.test.tsx`

  - [x] 5.4 Implementasi `SummaryBar` di `src/components/SummaryBar.tsx`
    - Props: `todos: Todo[]`
    - Hitung dan tampilkan: total, jumlah "Belum Selesai", jumlah "Selesai"
    - _Requirements: 2.4_

  - [x] 5.5 Tulis property test untuk SummaryBar
    - **Property 5: SummaryBar Menampilkan Hitungan yang Akurat** — gunakan arbitrary array of todos
    - **Validates: Requirements 2.4**
    - File: `src/__tests__/components/SummaryBar.test.tsx`

- [x] 6. Implementasi komponen form dan filter
  - [x] 6.1 Implementasi `TodoForm` di `src/components/TodoForm.tsx`
    - Input judul (controlled), selector priority (default "Sedang"), date picker, selector kategori
    - Validasi via `Validator` sebelum submit, tampilkan pesan error inline
    - Kosongkan form setelah submit berhasil
    - Submit via tombol "Tambah" atau Enter
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 6.2 Tulis property test untuk TodoForm
    - **Property 2: Input Field Dikosongkan Setelah Penambahan** — setelah submit valid, input kosong
    - **Validates: Requirements 1.3**
    - File: `src/__tests__/components/TodoForm.test.tsx`

  - [x] 6.3 Tulis unit test untuk TodoForm
    - Test submit dengan judul kosong menampilkan error
    - Test submit valid memanggil `onSubmit` dan mengosongkan field
    - Test default priority "Sedang"
    - File: `src/__tests__/components/TodoForm.test.tsx`

  - [x] 6.4 Implementasi `FilterBar` di `src/components/FilterBar.tsx`
    - Dropdown status, dropdown priority, dropdown kategori, input pencarian teks
    - Tombol "Reset Filter"
    - Props: `filter`, `categories`, `onChange`, `onReset`
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.8_

  - [x] 6.5 Tulis unit test untuk FilterBar
    - Test semua dropdown dan input terhubung ke props
    - Test tombol "Reset Filter" memanggil `onReset`
    - File: `src/__tests__/components/FilterBar.test.tsx`

  - [x] 6.6 Implementasi `SortBar` di `src/components/SortBar.tsx`
    - Dropdown field (createdAt, dueDate, priority) dan direction (asc, desc)
    - Props: `sort`, `onChange`
    - _Requirements: 7.1, 7.2_

- [x] 7. Implementasi logika filter dan sort
  - [x] 7.1 Buat fungsi `filterTodos` dan `sortTodos` di `src/utils/todoUtils.ts`
    - `filterTodos(todos, filter)`: terapkan semua kriteria filter secara bersamaan (AND logic)
    - Pencarian case-insensitive pada judul
    - `sortTodos(todos, sort)`: urutkan berdasarkan field + direction; priority mapping: Tinggi=3, Sedang=2, Rendah=1
    - _Requirements: 6.4, 6.6, 6.7, 7.2_

  - [x] 7.2 Tulis property test untuk filter
    - **Property 14: Filter Kombinasi Menampilkan Todo yang Memenuhi Semua Kriteria**
    - **Property 15: Pencarian Case-Insensitive**
    - **Validates: Requirements 6.4, 6.6, 6.7**
    - File: `src/__tests__/property/filter.property.test.ts`

  - [x] 7.3 Tulis property test untuk sort
    - **Property 16: Pengurutan Menghasilkan Urutan yang Benar** — setiap pasangan berurutan memenuhi relasi urutan
    - **Validates: Requirements 7.2**
    - File: `src/__tests__/property/sort.property.test.ts`

- [ ] 8. Implementasi komponen TodoItem dan TodoEditForm
  - [x] 8.1 Implementasi `TodoEditForm` di `src/components/TodoEditForm.tsx`
    - Props: `todo`, `onSave`, `onCancel`
    - Pre-populate semua field dengan data todo yang ada
    - Validasi judul sebelum simpan
    - Tombol "Simpan" dan "Batal"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [-] 8.2 Tulis property test untuk TodoEditForm
    - **Property 9: Form Edit Menampilkan Data Todo yang Benar** — semua field terisi sesuai data todo
    - **Property 11: Batal Edit Tidak Mengubah Todo** — `onCancel` dipanggil tanpa memanggil `onSave`
    - **Validates: Requirements 4.2, 4.5**
    - File: `src/__tests__/components/TodoEditForm.test.tsx`

  - [~] 8.3 Implementasi `TodoItem` di `src/components/TodoItem.tsx`
    - Props: `todo`, `onToggle`, `onEdit`, `onDelete`
    - Tampilkan: checkbox, judul (dengan strikethrough jika "Selesai"), badge priority, kategori, due date
    - Tampilkan indikator "Terlambat" jika dueDate < hari ini dan status "Belum Selesai"
    - Tombol "Edit" membuka `TodoEditForm` inline
    - Tombol "Hapus" membuka `ConfirmDialog`
    - _Requirements: 2.2, 2.5, 3.1, 3.2, 4.1, 5.1, 5.2_

  - [~] 8.4 Tulis property test untuk TodoItem
    - **Property 4: TodoItem Menampilkan Semua Atribut** — semua atribut todo dirender
    - **Property 6: Indikator "Terlambat" Muncul Tepat** — muncul iff dueDate lewat + status "Belum Selesai"
    - **Property 13: Batal Hapus Mempertahankan Todo** — `onDelete` tidak dipanggil saat batal
    - **Validates: Requirements 2.2, 2.5, 5.4**
    - File: `src/__tests__/components/TodoItem.test.tsx`

  - [~] 8.5 Tulis unit test untuk TodoItem
    - Test keberadaan checkbox, tombol Edit, tombol Hapus
    - Test strikethrough pada todo "Selesai"
    - Test indikator "Terlambat" tidak muncul pada todo "Selesai" meski dueDate lewat
    - File: `src/__tests__/components/TodoItem.test.tsx`

- [ ] 9. Implementasi TodoList dan CategoryManager
  - [~] 9.1 Implementasi `TodoList` di `src/components/TodoList.tsx`
    - Terima `todos` yang sudah difilter dan diurutkan
    - Render daftar `TodoItem`
    - Tampilkan pesan "Belum ada tugas. Tambahkan tugas pertama Anda!" jika list kosong
    - _Requirements: 2.1, 2.3_

  - [~] 9.2 Implementasi `CategoryManager` di `src/components/CategoryManager.tsx`
    - Props: `categories`, `todos`, `onAdd`, `onDelete`
    - Form tambah kategori baru dengan validasi
    - Daftar kategori dengan tombol hapus (disabled jika ada todo terkait)
    - Tampilkan pesan error dari Validator
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 9.3 Tulis property test untuk CategoryManager
    - **Property 17: Nama Kategori Unik** — submit nama duplikat menampilkan error
    - **Property 18: Kategori dengan Todo Tidak Bisa Dihapus** — tombol hapus disabled/error jika ada todo
    - **Property 19: Semua Kategori Muncul di Form Todo** — semua kategori ada di selector
    - **Validates: Requirements 8.2, 8.4, 8.5**
    - File: `src/__tests__/property/category.property.test.ts`

- [~] 10. Checkpoint — Pastikan semua komponen berfungsi secara terisolasi
  - Jalankan `vitest --run` dan pastikan semua test komponen lulus
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum melanjutkan.

- [ ] 11. Integrasi: Rakit semua komponen di App.tsx
  - [~] 11.1 Buat `src/App.tsx` yang merakit semua komponen
    - Bungkus seluruh aplikasi dengan `AppProvider`
    - Susun layout: `Header`, `TodoForm`, `CategoryManager`, `FilterBar`, `SortBar`, `SummaryBar`, `TodoList`, `NotificationToast`
    - Gunakan `useAppContext` untuk mengambil state dan dispatch
    - Terapkan `filterTodos` dan `sortTodos` sebelum meneruskan ke `TodoList`
    - Tombol "Hapus Semua Tugas Selesai" dengan `ConfirmDialog`
    - _Requirements: 1.1, 2.1, 5.5, 5.6, 6.7, 7.3_

  - [~] 11.2 Implementasi `Header` di `src/components/Header.tsx`
    - Judul aplikasi
    - Responsif untuk lebar 320px–1920px
    - _Requirements: 10.1_

  - [~] 11.3 Terapkan styling Tailwind CSS secara konsisten
    - Responsif (mobile-first)
    - Dark mode via `dark:` prefix (mengikuti preferensi sistem `prefers-color-scheme`)
    - Label deskriptif pada semua elemen interaktif (`aria-label`, `htmlFor`)
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [~] 11.4 Tulis integration test untuk alur utama
    - Test alur: tambah todo → muncul di list → toggle → status berubah → hapus → hilang dari list
    - **Property 1: Penambahan Todo Menghasilkan Todo di List**
    - **Validates: Requirements 1.2, 2.1, 3.2, 5.3**
    - File: `src/__tests__/property/todo.property.test.ts`

- [~] 12. Final Checkpoint — Pastikan semua test lulus dan aplikasi berjalan
  - Jalankan `vitest --run` dan pastikan seluruh test suite lulus (unit, component, property)
  - Verifikasi tidak ada TypeScript error dengan `tsc --noEmit`
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum selesai.

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Property tests menggunakan `fast-check` dengan minimum 100 runs per property
- Unit tests menggunakan Vitest + @testing-library/react
- Checkpoint memastikan validasi incremental sebelum melanjutkan ke fase berikutnya
