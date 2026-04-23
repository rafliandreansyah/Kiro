import { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { filterTodos, sortTodos } from './utils/todoUtils';
import type { TodoInput } from './types/index';

import Header from './components/Header';
import TodoForm from './components/TodoForm';
import FilterBar from './components/FilterBar';
import SortBar from './components/SortBar';
import SummaryBar from './components/SummaryBar';
import TodoList from './components/TodoList';
import CategoryManager from './components/CategoryManager';
import ConfirmDialog from './components/ConfirmDialog';
import NotificationToast from './components/NotificationToast';

export function AppContent() {
  const { state, dispatch } = useAppContext();
  const { todos, categories, filter, sort, notification } = state;

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showDeleteCompletedConfirm, setShowDeleteCompletedConfirm] = useState(false);

  const visibleTodos = sortTodos(filterTodos(todos, filter), sort);
  const completedCount = todos.filter((t) => t.status === 'Selesai').length;

  const handleAddTodo = (input: TodoInput) => {
    dispatch({ type: 'ADD_TODO', payload: input });
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: { id: crypto.randomUUID(), message: 'Tugas berhasil ditambahkan.', type: 'success' },
    });
  };

  const handleToggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  const handleEditTodo = (id: string, data: TodoInput) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, data } });
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: { id: crypto.randomUUID(), message: 'Tugas berhasil diperbarui.', type: 'success' },
    });
  };

  const handleDeleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: { id: crypto.randomUUID(), message: 'Tugas berhasil dihapus.', type: 'success' },
    });
  };

  const handleDeleteCompleted = () => {
    dispatch({ type: 'DELETE_COMPLETED' });
    setShowDeleteCompletedConfirm(false);
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: { id: crypto.randomUUID(), message: 'Semua tugas selesai berhasil dihapus.', type: 'success' },
    });
  };

  const handleAddCategory = (name: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: name });
  };

  const handleDeleteCategory = (name: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: name });
  };

  const handleDismissNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        {/* Add Todo */}
        <TodoForm onSubmit={handleAddTodo} categories={categories} />

        {/* Summary */}
        <SummaryBar todos={todos} />

        {/* Filter & Sort */}
        <FilterBar
          filter={filter}
          categories={categories}
          onChange={(f) => dispatch({ type: 'SET_FILTER', payload: f })}
          onReset={() => dispatch({ type: 'RESET_FILTER' })}
        />
        <SortBar
          sort={sort}
          onChange={(s) => dispatch({ type: 'SET_SORT', payload: s })}
        />

        {/* Actions row */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <button
            type="button"
            onClick={() => setShowCategoryManager((v) => !v)}
            aria-expanded={showCategoryManager}
            aria-controls="category-manager"
            className="text-sm px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showCategoryManager ? 'Sembunyikan Kategori' : 'Kelola Kategori'}
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowDeleteCompletedConfirm(true)}
              aria-label="Hapus semua tugas selesai"
              className="text-sm px-4 py-2 rounded-md bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Hapus Semua Tugas Selesai ({completedCount})
            </button>
          )}
        </div>

        {/* Category Manager */}
        {showCategoryManager && (
          <section
            id="category-manager"
            aria-label="Manajemen kategori"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <CategoryManager
              categories={categories}
              todos={todos}
              onAdd={handleAddCategory}
              onDelete={handleDeleteCategory}
            />
          </section>
        )}

        {/* Todo List */}
        <TodoList
          todos={visibleTodos}
          categories={categories}
          onToggle={handleToggleTodo}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
        />
      </main>

      {/* Confirm delete completed */}
      {showDeleteCompletedConfirm && (
        <ConfirmDialog
          message="Apakah Anda yakin ingin menghapus semua tugas yang sudah selesai?"
          onConfirm={handleDeleteCompleted}
          onCancel={() => setShowDeleteCompletedConfirm(false)}
        />
      )}

      {/* Notification */}
      <NotificationToast
        notification={notification}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
