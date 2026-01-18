/**
 * Home Screen
 */

import { startNewWorkout, quickStartWorkout, setState } from '../app-state';
import { getRecentWorkouts, getWorkout } from '../db';
import { exportWorkoutsToCSV } from '../utils/csv-export';
import type { Workout } from '../types';

export async function renderHomeScreen(): Promise<string> {
  const recentWorkouts = await getRecentWorkouts(5);

  return `
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="bg-blue-600 text-white p-4 shadow-md">
        <h1 class="text-2xl font-bold">Gym Logger</h1>
        <p class="text-sm text-blue-100">Track your workouts offline</p>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div class="space-y-4">
          <!-- Start Workout Button -->
          <button
            id="start-workout-btn"
            data-testid="start-workout-btn"
            class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition min-h-touch tap-highlight-transparent shadow-md">
            💪 Start New Workout
          </button>

          <!-- Recent Workouts Section -->
          <section class="mt-8">
            <h2 class="text-xl font-semibold mb-3 text-gray-800">Recent Workouts</h2>
            <div id="recent-workouts" class="space-y-2">
              ${recentWorkouts.length === 0 ? `
                <div class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p class="text-gray-500">No workouts yet</p>
                  <p class="text-sm text-gray-400 mt-1">Start your first workout above!</p>
                </div>
              ` : recentWorkouts.map(workout => renderWorkoutCard(workout)).join('')}
            </div>
            ${recentWorkouts.length > 0 ? `
            <button
              id="view-history-btn"
              class="w-full py-3 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition text-sm font-medium mt-3 min-h-touch tap-highlight-transparent">
              📜 View All Workouts
            </button>
            ` : ''}
          </section>

          <!-- Footer Actions -->
          <section class="mt-8 grid grid-cols-2 gap-2">
            <button
              id="exercise-library-btn"
              class="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm font-medium min-h-touch tap-highlight-transparent">
              📚 Exercise Library
            </button>
            <button
              id="export-data-btn"
              class="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm font-medium min-h-touch tap-highlight-transparent">
              📤 Export Data
            </button>
            <button
              id="settings-btn"
              class="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition text-sm font-medium min-h-touch tap-highlight-transparent col-span-2">
              ⚙️ Settings
            </button>
          </section>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t mt-8">
        <p>Gym Logger v0.0.1 - Works Offline 🔌</p>
      </footer>
    </div>
  `;
}

function renderWorkoutCard(workout: Workout): string {
  const date = new Date(workout.date);
  const exerciseCount = workout.exercises.length;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  // Extract exercise names for display
  const exerciseNames = workout.exercises.map((ex) => ex.exerciseName).join(', ');
  const exerciseDisplay =
    exerciseNames.length > 50 ? exerciseNames.substring(0, 47) + '...' : exerciseNames;

  return `
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          ${workout.name ? `
            <div class="text-base font-semibold text-gray-900">${workout.name}</div>
            <div class="text-sm text-gray-500">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          ` : `
            <div class="text-sm text-gray-500">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          `}
          <div class="text-gray-800 font-medium mt-1">
            ${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'} • ${totalSets} sets
          </div>
          <div class="text-xs text-gray-500 mt-1">${workout.duration} minutes</div>
          ${exerciseNames ? `<div class="text-sm text-gray-700 mt-2">${exerciseDisplay}</div>` : ''}
        </div>
        <div class="text-2xl">💪</div>
      </div>
      ${workout.notes ? `
        <div class="mt-2 text-sm text-gray-600 italic">"${workout.notes}"</div>
      ` : ''}
      <button
        data-quick-start-id="${workout.id}"
        class="home-quick-start-btn w-full mt-3 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition text-sm font-medium min-h-touch tap-highlight-transparent">
        ⚡ Quick Start
      </button>
    </div>
  `;
}

export function attachHomeEventListeners(): void {
  const startButton = document.getElementById('start-workout-btn');
  startButton?.addEventListener('click', () => {
    startNewWorkout();
  });

  const historyButton = document.getElementById('view-history-btn');
  historyButton?.addEventListener('click', () => {
    setState({ currentScreen: 'history' });
  });

  const exportButton = document.getElementById('export-data-btn');
  exportButton?.addEventListener('click', async () => {
    await exportWorkoutsToCSV();
  });

  const settingsButton = document.getElementById('settings-btn');
  settingsButton?.addEventListener('click', () => {
    setState({ currentScreen: 'settings' });
  });

  const exerciseLibraryButton = document.getElementById('exercise-library-btn');
  exerciseLibraryButton?.addEventListener('click', () => {
    setState({ currentScreen: 'exercise-library' });
  });

  // Quick Start buttons on recent workout cards
  const quickStartButtons = document.querySelectorAll('.home-quick-start-btn');
  quickStartButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const workoutId = (button as HTMLElement).getAttribute('data-quick-start-id');
      if (!workoutId) return;

      const workout = await getWorkout(Number(workoutId));
      if (workout) {
        quickStartWorkout(workout);
      }
    });
  });
}
