/**
 * Simple app state management
 */

import type { Workout, Exercise, Set } from './types';
import { DEFAULT_SETTINGS } from './types';

export type Screen = 'home' | 'workout' | 'history' | 'settings';

interface AppState {
  currentScreen: Screen;
  currentWorkout: Partial<Workout> | null;
  settings: typeof DEFAULT_SETTINGS;
}

let state: AppState = {
  currentScreen: 'home',
  currentWorkout: null,
  settings: { ...DEFAULT_SETTINGS },
};

type StateListener = () => void;
const listeners: StateListener[] = [];

export function getState(): AppState {
  return state;
}

export function setState(updates: Partial<AppState>): void {
  state = { ...state, ...updates };
  notifyListeners();
}

export function subscribe(listener: StateListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

function notifyListeners(): void {
  listeners.forEach(listener => listener());
}

// Workout management helpers
export function startNewWorkout(): void {
  const now = new Date();
  setState({
    currentScreen: 'workout',
    currentWorkout: {
      date: now.toISOString().split('T')[0],
      startTime: now.toISOString(),
      exercises: [],
      notes: '',
    },
  });
}

export function addExerciseToWorkout(exerciseName: string): void {
  const { currentWorkout } = state;
  if (!currentWorkout) return;

  const newExercise: Exercise = {
    exerciseName,
    notes: '',
    sets: [],
  };

  setState({
    currentWorkout: {
      ...currentWorkout,
      exercises: [...(currentWorkout.exercises || []), newExercise],
    },
  });
}

export function addSetToExercise(exerciseIndex: number, set: Set): void {
  const { currentWorkout } = state;
  if (!currentWorkout || !currentWorkout.exercises) return;

  const exercises = [...currentWorkout.exercises];
  exercises[exerciseIndex] = {
    ...exercises[exerciseIndex],
    sets: [...exercises[exerciseIndex].sets, set],
  };

  setState({
    currentWorkout: {
      ...currentWorkout,
      exercises,
    },
  });
}

export function cancelWorkout(): void {
  setState({
    currentScreen: 'home',
    currentWorkout: null,
  });
}
