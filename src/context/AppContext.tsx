import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { AppState } from '../types/index';
import { todoReducer, initialState } from './todoReducer';
import type { AppAction } from './todoReducer';
import StorageService from '../services/storageService';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // On mount: load from storage and dispatch LOAD_STATE
  useEffect(() => {
    if (!StorageService.isAvailable()) {
      dispatch({
        type: 'SHOW_NOTIFICATION',
        payload: {
          id: crypto.randomUUID(),
          message: 'Penyimpanan lokal tidak tersedia. Data tidak akan tersimpan setelah halaman ditutup.',
          type: 'warning',
        },
      });
      return;
    }

    const saved = StorageService.load();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Persist state to storage after every state change
  useEffect(() => {
    if (StorageService.isAvailable()) {
      StorageService.save(state);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
