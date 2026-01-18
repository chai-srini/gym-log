/**
 * Home Screen
 */

import { startNewWorkout } from '../app-state';
import { getRecentWorkouts, getLastWorkout } from '../db';
import type { Workout } from '../types';

export async function renderHomeScreen(): Promise<string> {
  const recentWorkouts = await getRecentWorkouts(5);
  const lastWorkout = await getLastWorkout();

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

          <!-- Quick Start Button -->
          ${lastWorkout ? `
          <button
            id="quick-start-btn"
            data-testid="quick-start-btn"
            class="w-full py-4 px-6 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 active:bg-green-800 transition min-h-touch tap-highlight-transparent shadow-md">
            ⚡ Quick Start
            <span class="text-sm block text-green-100 mt-1">Last: ${lastWorkout.exercises.length} exercises</span>
          </button>
          ` : ''}

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
            <a href="#history" class="text-blue-600 hover:underline block mt-3 text-center text-sm">
              View All Workouts →
            </a>
            ` : ''}
          </section>

          <!-- Footer Actions -->
          <section class="mt-8 grid grid-cols-2 gap-2">
            <button class="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              📚 Exercise Library
            </button>
            <button class="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              📤 Export Data
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

  return `
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="text-sm text-gray-500">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div class="text-gray-800 font-medium mt-1">
            ${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'} • ${totalSets} sets
          </div>
          <div class="text-xs text-gray-500 mt-1">${workout.duration} minutes</div>
        </div>
        <div class="text-2xl">💪</div>
      </div>
      ${workout.notes ? `
        <div class="mt-2 text-sm text-gray-600 italic">"${workout.notes}"</div>
      ` : ''}
    </div>
  `;
}

export function attachHomeEventListeners(): void {
  const startButton = document.getElementById('start-workout-btn');
  startButton?.addEventListener('click', () => {
    startNewWorkout();
  });

  const quickStartButton = document.getElementById('quick-start-btn');
  quickStartButton?.addEventListener('click', () => {
    alert('Quick Start coming soon!');
  });
}
