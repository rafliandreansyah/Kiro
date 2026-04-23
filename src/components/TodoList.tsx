import type { Category, Todo, TodoInput } from '../types/index';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (id: string) => void;
  onEdit: (id: string, data: TodoInput) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, categories, onToggle, onEdit, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">Belum ada tugas. Tambahkan tugas pertama Anda!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Daftar tugas">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          categories={categories}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
