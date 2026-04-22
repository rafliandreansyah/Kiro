export interface Todo {
  id: string;           // UUID v4
  title: string;        // 1–200 karakter
  status: 'Belum Selesai' | 'Selesai';
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  category: string | null;  // nama kategori atau null
  dueDate: string | null;   // ISO 8601 date string (YYYY-MM-DD) atau null
  createdAt: string;        // ISO 8601 datetime string
}

export interface Category {
  id: string;    // UUID v4
  name: string;  // unik, tidak boleh kosong
}

export interface FilterState {
  status: 'Semua' | 'Belum Selesai' | 'Selesai';
  priority: 'Semua' | 'Rendah' | 'Sedang' | 'Tinggi';
  category: string | null;  // nama kategori atau null = semua
  search: string;
}

export type SortField = 'createdAt' | 'dueDate' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface TodoInput {
  title: string;
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  category: string | null;
  dueDate: string | null;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export interface AppState {
  todos: Todo[];
  categories: Category[];
  filter: FilterState;
  sort: SortState;
  notification: Notification | null;
}

export interface PersistedState {
  todos: Todo[];
  categories: Category[];
}
