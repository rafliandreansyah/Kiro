import { Todo, FilterState, SortState } from '../types/index';

const PRIORITY_MAP: Record<'Rendah' | 'Sedang' | 'Tinggi', number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

export function filterTodos(todos: Todo[], filter: FilterState): Todo[] {
  return todos.filter((todo) => {
    if (filter.status !== 'Semua' && todo.status !== filter.status) return false;
    if (filter.priority !== 'Semua' && todo.priority !== filter.priority) return false;
    if (filter.category !== null && todo.category !== filter.category) return false;
    if (filter.search.trim() !== '') {
      const query = filter.search.trim().toLowerCase();
      if (!todo.title.toLowerCase().includes(query)) return false;
    }
    return true;
  });
}

export function sortTodos(todos: Todo[], sort: SortState): Todo[] {
  const sorted = [...todos];
  const { field, direction } = sort;
  const multiplier = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    if (field === 'createdAt') {
      return multiplier * a.createdAt.localeCompare(b.createdAt);
    }

    if (field === 'dueDate') {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;   // nulls go last regardless of direction
      if (b.dueDate === null) return -1;
      return multiplier * a.dueDate.localeCompare(b.dueDate);
    }

    if (field === 'priority') {
      const diff = PRIORITY_MAP[a.priority] - PRIORITY_MAP[b.priority];
      return multiplier * diff;
    }

    return 0;
  });

  return sorted;
}
