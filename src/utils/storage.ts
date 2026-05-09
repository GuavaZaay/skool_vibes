import { AppState } from '../types';

const STORAGE_KEY = 'keepscore_data';

const defaultState: AppState = {
  teams: [],
  games: [],
  activeGameId: null,
};

export function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return defaultState;
    const parsed = JSON.parse(serialized) as AppState;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    console.error('Failed to save state to localStorage');
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
