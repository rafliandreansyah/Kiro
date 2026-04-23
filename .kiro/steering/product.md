# Product

A single-page Todo List application built in React. Users can create, edit, delete, and toggle todos, organize them by category, filter and sort the list, and receive in-app notifications for key actions. All data is persisted to `localStorage`.

## Domain Language (Indonesian)

The UI and domain values use Indonesian:

| Concept | Value(s) |
|---|---|
| Status | `Belum Selesai` (incomplete), `Selesai` (done) |
| Priority | `Rendah` (low), `Sedang` (medium), `Tinggi` (high) |
| Filter "all" sentinel | `Semua` |

Keep these exact string literals consistent across types, reducer, components, and tests.
