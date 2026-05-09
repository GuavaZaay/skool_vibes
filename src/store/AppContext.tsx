import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Team, Game, StatEvent } from '../types';
import { loadState, saveState } from '../utils/storage';

type Action =
  | { type: 'ADD_TEAM'; team: Team }
  | { type: 'UPDATE_TEAM'; team: Team }
  | { type: 'DELETE_TEAM'; teamId: string }
  | { type: 'ADD_GAME'; game: Game }
  | { type: 'UPDATE_GAME'; game: Game }
  | { type: 'SET_ACTIVE_GAME'; gameId: string | null }
  | { type: 'ADD_EVENT'; gameId: string; event: StatEvent }
  | { type: 'UPDATE_EVENT'; gameId: string; event: StatEvent }
  | { type: 'DELETE_EVENT'; gameId: string; eventId: string }
  | { type: 'END_GAME'; gameId: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.team] };

    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map((t) => (t.id === action.team.id ? action.team : t)),
      };

    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter((t) => t.id !== action.teamId),
      };

    case 'ADD_GAME':
      return { ...state, games: [...state.games, action.game] };

    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map((g) => (g.id === action.game.id ? action.game : g)),
      };

    case 'SET_ACTIVE_GAME':
      return { ...state, activeGameId: action.gameId };

    case 'ADD_EVENT':
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? { ...g, events: [...g.events, action.event] }
            : g
        ),
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? {
                ...g,
                events: g.events.map((e) =>
                  e.id === action.event.id ? action.event : e
                ),
              }
            : g
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        games: state.games.map((g) =>
          g.id === action.gameId
            ? { ...g, events: g.events.filter((e) => e.id !== action.eventId) }
            : g
        ),
      };

    case 'END_GAME':
      return {
        ...state,
        activeGameId: state.activeGameId === action.gameId ? null : state.activeGameId,
        games: state.games.map((g) =>
          g.id === action.gameId ? { ...g, status: 'final' } : g
        ),
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useActiveGame() {
  const { state } = useApp();
  if (!state.activeGameId) return null;
  return state.games.find((g) => g.id === state.activeGameId) ?? null;
}
