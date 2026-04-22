import type {
  AppState,
  Todo,
  TodoInput,
  FilterState,
  SortState,
  Notification,
  Category,
} from '../types/index';

export type AppAction =
  | { type: 'ADD_TODO'; payload: TodoInput }
  | { type: 'UPDATE_TODO'; payload: { id: string; data: TodoInput } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_COMPLETED' }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'SET_SORT'; payload: SortState }
  | { type: 'RESET_FILTER' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SHOW_NOTIFICATION'; payload: Notification }
  | { type: 'HIDE_NOTIFICATION' };

export const initialState: AppState = {
  todos: [],
  categories: [],
  filter: {
    status: 'Semua',
    priority: 'Semua',
    category: null,
    search: '',
  },
  sort: {
    field: 'createdAt',
    direction: 'desc',
  },
  notification: null,
};

export function todoReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: action.payload.title,
        status: 'Belum Selesai',
        priority: action.payload.priority,
        category: action.payload.category,
        dueDate: action.payload.dueDate,
        createdAt: new Date().toISOString(),
      };
      return { ...state, todos: [...state.todos, newTodo] };
    }

    case 'UPDATE_TODO': {
      const { id, data } = action.payload;
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, ...data }
            : todo
        ),
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? {
                ...todo,
                status: todo.status === 'Belum Selesai' ? 'Selesai' : 'Belum Selesai',
              }
            : todo
        ),
      };
    }

    case 'DELETE_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.status !== 'Selesai'),
      };
    }

    case 'ADD_CATEGORY': {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: action.payload,
      };
      return { ...state, categories: [...state.categories, newCategory] };
    }

    case 'DELETE_CATEGORY': {
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.name !== action.payload),
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
      };
    }

    case 'SET_SORT': {
      return { ...state, sort: action.payload };
    }

    case 'RESET_FILTER': {
      return { ...state, filter: initialState.filter };
    }

    case 'LOAD_STATE': {
      return { ...state, ...action.payload };
    }

    case 'SHOW_NOTIFICATION': {
      return { ...state, notification: action.payload };
    }

    case 'HIDE_NOTIFICATION': {
      return { ...state, notification: null };
    }

    default:
      return state;
  }
}
