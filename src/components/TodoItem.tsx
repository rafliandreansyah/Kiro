import { useState } from 'react';
import type { Category, Todo, TodoInput } from '../types/index';
import ConfirmDialog from './ConfirmDialog';
import TodoEditForm from './TodoEditForm';

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onToggle: (id: string) => void;
  onEdit: (id: string, data: TodoInput) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGE: Record<Todo['priority'], string> = {
  Tinggi: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  Sedang: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Rendah: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

function isOverdue(dueDate: string | null, status: Todo['status']): boolean {
  if (!dueDate || status === 'Selesai') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return due < today;
}

export default function TodoItem({ todo, categories, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const overdue = isOverdue(todo.dueDate, todo.status);
  const isDone = todo.status === 'Selesai';

  const handleSave = (data: TodoInput) => {
    onEdit(todo.id, data);
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    setShowConfirm(false);
    onDelete(todo.id);
  };

  if (isEditing) {
    return (
      <li className="list-none">
        <TodoEditForm
          todo={todo}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <>
      <li
        className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 flex items-start gap-3"
        aria-label={`Tugas: ${todo.title}`}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggle(todo.id)}
          aria-label={`Tandai tugas "${todo.title}" sebagai ${isDone ? 'belum selesai' : 'selesai'}`}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-medium break-words ${
                isDone
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-800 dark:text-gray-100'
              }`}
            >
              {todo.title}
            </span>

            {/* Priority badge */}
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[todo.priority]}`}
              aria-label={`Prioritas: ${todo.priority}`}
            >
              {todo.priority}
            </span>

            {/* Overdue indicator */}
            {overdue && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white"
                aria-label="Terlambat"
              >
                Terlambat
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {todo.category && (
              <span aria-label={`Kategori: ${todo.category}`}>
                🏷 {todo.category}
              </span>
            )}
            {todo.dueDate && (
              <span aria-label={`Tanggal jatuh tempo: ${todo.dueDate}`}>
                📅 {todo.dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            aria-label={`Edit tugas "${todo.title}"`}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Edit
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            aria-label={`Hapus tugas "${todo.title}"`}
            className="text-xs px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Hapus
          </button>
        </div>
      </li>

      {showConfirm && (
        <ConfirmDialog
          message="Apakah Anda yakin ingin menghapus tugas ini?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
