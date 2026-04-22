import { useState, type FormEvent } from 'react';
import type { Category, Todo, TodoInput } from '../types/index';
import { validateTodoTitle } from '../utils/validator';

interface TodoEditFormProps {
  todo: Todo;
  onSave: (data: TodoInput) => void;
  onCancel: () => void;
  categories: Category[];
}

const PRIORITY_OPTIONS: TodoInput['priority'][] = ['Rendah', 'Sedang', 'Tinggi'];

export default function TodoEditForm({ todo, onSave, onCancel, categories }: TodoEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState<TodoInput['priority']>(todo.priority);
  const [category, setCategory] = useState<string>(todo.category ?? '');
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();

    const validation = validateTodoTitle(title);
    if (!validation.valid) {
      setTitleError(validation.error ?? 'Input tidak valid');
      return;
    }

    setTitleError('');
    onSave({
      title: title.trim(),
      priority,
      category: category || null,
      dueDate: dueDate || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Form edit tugas"
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-3"
    >
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-todo-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Judul Tugas <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="edit-todo-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          placeholder="Masukkan judul tugas..."
          aria-label="Judul tugas"
          aria-describedby={titleError ? 'edit-todo-title-error' : undefined}
          aria-invalid={!!titleError}
          className={`border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            titleError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {titleError && (
          <p id="edit-todo-title-error" role="alert" className="text-xs text-red-500 mt-0.5">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Priority */}
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="edit-todo-priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Prioritas
          </label>
          <select
            id="edit-todo-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoInput['priority'])}
            aria-label="Prioritas tugas"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="edit-todo-due-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tanggal Jatuh Tempo
          </label>
          <input
            id="edit-todo-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Tanggal jatuh tempo"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="edit-todo-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Kategori
          </label>
          <select
            id="edit-todo-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Kategori tugas"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">-- Tanpa Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 self-end">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Batal edit tugas"
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          aria-label="Simpan perubahan tugas"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
