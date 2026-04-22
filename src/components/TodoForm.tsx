import { useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Category, TodoInput } from '../types/index';
import { validateTodoTitle } from '../utils/validator';

interface TodoFormProps {
  onSubmit: (input: TodoInput) => void;
  categories: Category[];
}

const PRIORITY_OPTIONS: TodoInput['priority'][] = ['Rendah', 'Sedang', 'Tinggi'];

export default function TodoForm({ onSubmit, categories }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoInput['priority']>('Sedang');
  const [category, setCategory] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();

    const validation = validateTodoTitle(title);
    if (!validation.valid) {
      setTitleError(validation.error ?? 'Input tidak valid');
      return;
    }

    setTitleError('');
    onSubmit({
      title: title.trim(),
      priority,
      category: category || null,
      dueDate: dueDate || null,
    });

    // Reset form
    setTitle('');
    setPriority('Sedang');
    setCategory('');
    setDueDate('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Form tambah tugas"
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-3"
    >
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="todo-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Judul Tugas <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Masukkan judul tugas..."
          aria-label="Judul tugas"
          aria-describedby={titleError ? 'todo-title-error' : undefined}
          aria-invalid={!!titleError}
          className={`border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            titleError ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {titleError && (
          <p id="todo-title-error" role="alert" className="text-xs text-red-500 mt-0.5">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Priority */}
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="todo-priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Prioritas
          </label>
          <select
            id="todo-priority"
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
          <label htmlFor="todo-due-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tanggal Jatuh Tempo
          </label>
          <input
            id="todo-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Tanggal jatuh tempo"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="todo-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Kategori
          </label>
          <select
            id="todo-category"
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

      {/* Submit */}
      <button
        type="submit"
        aria-label="Tambah tugas"
        className="self-end bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        Tambah
      </button>
    </form>
  );
}
