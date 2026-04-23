import { useState } from 'react';
import type { Category, Todo } from '../types/index';
import { validateCategoryName } from '../utils/validator';

interface CategoryManagerProps {
  categories: Category[];
  todos: Todo[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}

export default function CategoryManager({ categories, todos, onAdd, onDelete }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasTodosForCategory = (categoryName: string): boolean =>
    todos.some((todo) => todo.category === categoryName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCategoryName(newName, categories);
    if (!result.valid) {
      setError(result.error ?? 'Nama kategori tidak valid');
      return;
    }
    onAdd(newName.trim());
    setNewName('');
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kelola Kategori</h2>

      {/* Add category form */}
      <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Form tambah kategori">
        <div className="flex-1">
          <input
            type="text"
            value={newName}
            onChange={handleInputChange}
            placeholder="Nama kategori baru"
            aria-label="Nama kategori baru"
            aria-describedby={error ? 'category-error' : undefined}
            className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              error
                ? 'border-red-400 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {error && (
            <p
              id="category-error"
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          Tambah
        </button>
      </form>

      {/* Category list */}
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada kategori.</p>
      ) : (
        <ul className="space-y-2" aria-label="Daftar kategori">
          {categories.map((cat) => {
            const hasRelatedTodos = hasTodosForCategory(cat.name);
            return (
              <li
                key={cat.id}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm text-gray-800 dark:text-gray-100">{cat.name}</span>
                <button
                  onClick={() => !hasRelatedTodos && onDelete(cat.name)}
                  disabled={hasRelatedTodos}
                  aria-label={`Hapus kategori ${cat.name}`}
                  title={hasRelatedTodos ? 'Kategori ini masih digunakan oleh tugas' : 'Hapus kategori'}
                  className="text-xs px-3 py-1 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                >
                  Hapus
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
