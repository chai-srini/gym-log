/**
 * Simple app state management
 */

import type { Workout, Exercise, Set, AppSettings, WorkoutTemplate, Screen as ScreenType } from './types';
import { DEFAULT_SETTINGS } from './types';
import { incrementTemplateUsage } from './db';

export type Screen = ScreenType;

interface AppState {
  currentScreen: Screen;
  currentWorkout: Partial<Workout> | null;
  settings: typeof DEFAULT_SETTINGS;
}

const SETTINGS_STORAGE_KEY = 'gym-log-settings';

// Load settings from localStorage on initialization
function loadSettingsFromStorage(): typeof DEFAULT_SETTINGS {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

let state: AppState = {
  currentScreen: 'home',
  currentWorkout: null,
  settings: loadSettingsFromStorage(),
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
      name: '',
      date: now.toISOString().split('T')[0],
      startTime: now.toISOString(),
      exercises: [],
      notes: '',
    },
  });
}

export function quickStartWorkout(lastWorkout: Workout): void {
  const now = new Date();

  // Create new exercises with same names but empty sets
  const exercises: Exercise[] = lastWorkout.exercises.map((ex) => ({
    exerciseName: ex.exerciseName,
    notes: '',
    sets: [],
  }));

  setState({
    currentScreen: 'workout',
    currentWorkout: {
      name: lastWorkout.name || '',
      date: now.toISOString().split('T')[0],
      startTime: now.toISOString(),
      exercises: exercises,
      notes: '',
    },
  });
}

export function startWorkoutFromTemplate(template: WorkoutTemplate): void {
  const now = new Date();

  // Create exercises with names from template, empty sets
  const exercises: Exercise[] = template.exercises.map((exerciseName) => ({
    exerciseName,
    notes: '',
    sets: [],
  }));

  setState({
    currentScreen: 'workout',
    currentWorkout: {
      name: template.name,
      date: now.toISOString().split('T')[0],
      startTime: now.toISOString(),
      exercises: exercises,
      notes: '',
    },
  });

  // Increment template usage asynchronously
  if (template.id) {
    incrementTemplateUsage(template.id).catch((error) => {
      console.error('Failed to increment template usage:', error);
    });
  }
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

export function deleteExerciseFromWorkout(exerciseIndex: number): void {
  const { currentWorkout } = state;
  if (!currentWorkout || !currentWorkout.exercises) return;

  const exercises = [...currentWorkout.exercises];
  exercises.splice(exerciseIndex, 1);

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

export function updateWorkoutName(name: string): void {
  const { currentWorkout } = state;
  if (!currentWorkout) return;

  setState({
    currentWorkout: {
      ...currentWorkout,
      name,
    },
  });
}

// Settings management
function saveSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
    alert('Failed to save settings. Please try again.');
  }
}

export function updateSettings(newSettings: Partial<AppSettings>): void {
  const updatedSettings = { ...state.settings, ...newSettings };
  setState({ settings: updatedSettings });
  saveSettingsToStorage(updatedSettings);
}
