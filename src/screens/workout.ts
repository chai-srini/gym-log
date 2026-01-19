/**
 * Workout Screen - Active workout logging
 */

import { getState, addExerciseToWorkout, addSetToExercise, cancelWorkout, setState, updateWorkoutName, deleteExerciseFromWorkout } from '../app-state';
import { getAllExercises, addWorkout, incrementExerciseUsage, getExerciseByName } from '../db';
import type { Set, ExerciseLibraryItem } from '../types';
import { startRestTimer, stopRestTimer, getTimerState, subscribeToTimer, requestNotificationPermission } from '../utils/rest-timer';
import { openEditLinksModal } from '../utils/edit-links-modal';

let workoutStartTime: number = Date.now();
let timerInterval: number | null = null;
let timerUnsubscribe: (() => void) | null = null;

export async function renderWorkoutScreen(): Promise<string> {
  workoutStartTime = Date.now();
  const { currentWorkout } = getState();
  const exercises = await getAllExercises();

  if (!currentWorkout) {
    return '<div>Error: No active workout</div>';
  }

  // Fetch exercise library data for all exercises in the workout
  const exerciseDataMap = new Map<string, ExerciseLibraryItem>();
  if (currentWorkout.exercises && currentWorkout.exercises.length > 0) {
    const exerciseDataPromises = currentWorkout.exercises.map(ex =>
      getExerciseByName(ex.exerciseName)
    );
    const exerciseDataResults = await Promise.all(exerciseDataPromises);
    currentWorkout.exercises.forEach((ex, idx) => {
      const data = exerciseDataResults[idx];
      if (data) {
        exerciseDataMap.set(ex.exerciseName, data);
      }
    });
  }

  startTimer();

  const restTimerState = getTimerState();

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Rest Timer Modal -->
      ${restTimerState.isActive ? renderRestTimer(restTimerState) : ''}

      <!-- Header with Timer -->
      <header class="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-bold">Active Workout</h1>
            <div id="workout-timer" class="text-sm text-blue-100">00:00</div>
          </div>
          <button
            id="cancel-workout-btn"
            class="text-white hover:bg-blue-700 px-3 py-2 rounded transition text-sm">
            Cancel
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <!-- Workout Name -->
        <div class="mb-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <label for="workout-name-input" class="block text-sm font-medium text-gray-700 mb-2">
            Workout Name (Optional)
          </label>
          <input
            id="workout-name-input"
            type="text"
            placeholder="e.g., Back and Biceps, Leg Day"
            value="${currentWorkout.name || ''}"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Exercises List -->
        <div id="exercises-container" class="space-y-4">
          ${currentWorkout.exercises && currentWorkout.exercises.length > 0
            ? currentWorkout.exercises.map((ex, idx) => renderExercise(ex, idx, exerciseDataMap.get(ex.exerciseName))).join('')
            : `
            <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p class="text-gray-500 text-lg">No exercises yet</p>
              <p class="text-sm text-gray-400 mt-2">Add your first exercise below!</p>
            </div>
          `}
        </div>

        <!-- Add Exercise Section -->
        <div class="mt-6 bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <h3 class="font-semibold text-gray-800 mb-3">Add Exercise</h3>
          <select
            id="exercise-select"
            class="w-full p-3 border border-gray-300 rounded-lg mb-3 text-gray-800 bg-white">
            <option value="">Select an exercise...</option>
            ${exercises.map(ex => `<option value="${ex.name}">${ex.name}</option>`).join('')}
          </select>
          <button
            id="add-exercise-btn"
            class="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            ➕ Add Exercise
          </button>
        </div>

        <!-- Complete Workout Button -->
        ${currentWorkout.exercises && currentWorkout.exercises.length > 0 ? `
        <button
          id="complete-workout-btn"
          class="w-full mt-6 py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-700 transition shadow-lg">
          ✅ Complete Workout
        </button>
        ` : ''}
      </main>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimerColor(elapsedSeconds: number, presetSeconds: number): {
  bgClass: string;
  textClass: string;
  strokeColor: string;
} {
  const ratio = elapsedSeconds / presetSeconds;

  if (ratio <= 1) {
    // Green zone (0 to preset)
    return {
      bgClass: 'bg-green-50',
      textClass: 'text-green-600',
      strokeColor: '#16a34a',
    };
  } else if (ratio <= 3) {
    // Transition zone (preset to 3x preset)
    // Linear interpolation from green to red
    const t = (ratio - 1) / 2; // 0 to 1

    // Green #16a34a to Red #dc2626
    const r = Math.round(22 + (220 - 22) * t);
    const g = Math.round(163 + (38 - 163) * t);
    const b = Math.round(74 + (38 - 74) * t);

    const intensity = t < 0.5 ? 'green' : (t < 0.75 ? 'yellow' : 'orange');
    return {
      bgClass: `bg-${intensity}-50`,
      textClass: `text-${intensity}-600`,
      strokeColor: `rgb(${r}, ${g}, ${b})`,
    };
  } else {
    // Red zone (3x preset and beyond)
    return {
      bgClass: 'bg-red-50',
      textClass: 'text-red-600',
      strokeColor: '#dc2626',
    };
  }
}

function renderRestTimer(timerState: any): string {
  const minutes = Math.floor(timerState.elapsedSeconds / 60);
  const seconds = timerState.elapsedSeconds % 60;

  // Progress: 0% at 0s, 100% at preset, stays at 100% after
  const progress = Math.min((timerState.elapsedSeconds / timerState.presetSeconds) * 100, 100);

  // Get color based on elapsed time
  const { bgClass, textClass, strokeColor } = getTimerColor(timerState.elapsedSeconds, timerState.presetSeconds);

  const circumference = 2 * Math.PI * 88; // r=88
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return `
    <div id="rest-timer-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="${bgClass} rounded-2xl p-8 mx-4 max-w-md w-full shadow-2xl border-2 border-opacity-30">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Rest Timer</h2>
          <p class="text-sm text-gray-600 mb-6">Take a break between sets</p>

          <div class="relative mb-6">
            <svg class="transform -rotate-90 w-48 h-48 mx-auto">
              <circle cx="96" cy="96" r="88" stroke="#e5e7eb" stroke-width="8" fill="none" />
              <circle cx="96" cy="96" r="88" stroke="${strokeColor}" stroke-width="8" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" class="transition-all duration-1000" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div id="rest-timer-display" class="${textClass} text-6xl font-bold tabular-nums">
                  ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
                </div>
                <div class="text-sm text-gray-600 mt-1">elapsed</div>
              </div>
            </div>
          </div>

          <button id="rest-timer-skip" class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition">End Rest</button>
        </div>
      </div>
    </div>
  `;
}

function renderExercise(exercise: any, exerciseIndex: number, exerciseData?: ExerciseLibraryItem): string {
  const { settings } = getState();
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const links = exerciseData?.links || [];
  const hasLinks = links.length > 0;
  const exerciseType = exerciseData?.type || 'strength';

  // Helper to render set display based on type
  const renderSetDisplay = (set: Set) => {
    if (exerciseType === 'cardio') {
      const minutes = Math.round((set.duration || 0) / 60);
      return `
        <div class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
          <span class="font-medium text-gray-600">Activity</span>
          <span class="text-gray-800">Duration: ${minutes} min</span>
        </div>
      `;
    } else if (exerciseType === 'bodyweight') {
      return `
        <div class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
          <span class="font-medium text-gray-600">Set ${set.setNumber}</span>
          <span class="text-gray-800">${set.reps} reps</span>
          <span class="text-gray-500">Rest ${set.restTime}s</span>
        </div>
      `;
    } else {
      // strength
      return `
        <div class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
          <span class="font-medium text-gray-600">Set ${set.setNumber}</span>
          <span class="text-gray-800">${set.weight} ${settings.weightUnit} × ${set.reps} reps</span>
          <span class="text-gray-500">RPE ${set.rpe}% • ${set.restTime}s</span>
        </div>
      `;
    }
  };

  // Helper to render input form based on type
  const renderInputForm = () => {
    if (exerciseType === 'cardio') {
      const lastDuration = lastSet?.duration || 0;
      const minutes = Math.round(lastDuration / 60);
      return `
        <div class="mb-3">
          <label class="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
          <input
            type="number"
            class="set-input w-full p-2 border border-gray-300 rounded"
            data-exercise="${exerciseIndex}"
            data-field="duration"
            value="${minutes || ''}"
            placeholder="30">
        </div>
      `;
    } else if (exerciseType === 'bodyweight') {
      return `
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Reps</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="reps"
              value="${lastSet ? lastSet.reps : ''}"
              placeholder="12">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Rest (sec)</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="restTime"
              value="${lastSet ? lastSet.restTime : settings.defaultRestTime}"
              placeholder="60">
          </div>
        </div>
      `;
    } else {
      // strength
      return `
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Weight (${settings.weightUnit})</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="weight"
              value="${lastSet ? lastSet.weight : ''}"
              placeholder="185">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Reps</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="reps"
              value="${lastSet ? lastSet.reps : ''}"
              placeholder="8">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">RPE (%)</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="rpe"
              value="${lastSet ? lastSet.rpe : settings.defaultRPE}"
              placeholder="80">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Rest (sec)</label>
            <input
              type="number"
              class="set-input w-full p-2 border border-gray-300 rounded"
              data-exercise="${exerciseIndex}"
              data-field="restTime"
              value="${lastSet ? lastSet.restTime : settings.defaultRestTime}"
              placeholder="60">
          </div>
        </div>
      `;
    }
  };

  const buttonText = exerciseType === 'cardio' ? '✓ Log Activity' : '+ Add Set';

  return `
    <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200" data-exercise-index="${exerciseIndex}" data-exercise-type="${exerciseType}">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-800">${exercise.exerciseName}</h3>
        <button
          class="delete-exercise-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          data-exercise-index="${exerciseIndex}"
          title="Delete exercise">
          🗑️
        </button>
      </div>

      <!-- Video Links Section -->
      ${hasLinks ? `
        <div class="mb-3">
          <button
            class="video-toggle-btn flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition"
            data-exercise-index="${exerciseIndex}">
            <span class="toggle-icon">▶</span>
            <span>📹 Videos (${links.length})</span>
          </button>
          <div class="video-links-container hidden mt-2 space-y-2 pl-6" data-exercise-index="${exerciseIndex}">
            ${links.map(link => `
              <div class="flex items-center gap-2 text-sm">
                <span>🎥</span>
                <a
                  href="${escapeHtml(link.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline flex-1 truncate">
                  ${escapeHtml(link.title)}
                </a>
                <span class="text-gray-400">↗</span>
              </div>
            `).join('')}
            <button
              class="edit-links-btn text-xs text-purple-600 hover:text-purple-700 font-medium mt-1"
              data-exercise-index="${exerciseIndex}">
              ✏️ Edit Links
            </button>
          </div>
        </div>
      ` : `
        <div class="mb-3">
          <button
            class="add-links-btn text-sm text-purple-600 hover:text-purple-700 font-medium"
            data-exercise-index="${exerciseIndex}">
            + Add video links
          </button>
        </div>
      `}

      <!-- Sets List -->
      ${exercise.sets.length > 0 ? `
        <div class="space-y-2 mb-4">
          ${exercise.sets.map((set: Set) => renderSetDisplay(set)).join('')}
        </div>
      ` : `<p class="text-sm text-gray-500 mb-4">${exerciseType === 'cardio' ? 'No activity logged yet' : 'No sets yet'}</p>`}

      <!-- Add Set Form -->
      ${renderInputForm()}
      <button
        class="add-set-btn w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        data-exercise="${exerciseIndex}">
        ${buttonText}
      </button>
    </div>
  `;
}

function startTimer(): void {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timerEl = document.getElementById('workout-timer');
    if (timerEl) {
      timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function attachWorkoutEventListeners(): void {
  // Request notification permission on first interaction
  requestNotificationPermission();

  // Unsubscribe from previous timer if exists
  if (timerUnsubscribe) {
    timerUnsubscribe();
  }

  // Subscribe to timer updates
  timerUnsubscribe = subscribeToTimer(() => {
    const currentState = getState();
    if (currentState.currentScreen === 'workout') {
      setState({ ...currentState });
    }
  });

  // Workout Name Input - update on blur to avoid re-render issues
  const workoutNameInput = document.getElementById('workout-name-input') as HTMLInputElement;
  workoutNameInput?.addEventListener('blur', (e) => {
    const name = (e.target as HTMLInputElement).value;
    updateWorkoutName(name);
  });

  // Add Exercise
  const addExerciseBtn = document.getElementById('add-exercise-btn');
  const exerciseSelect = document.getElementById('exercise-select') as HTMLSelectElement;

  addExerciseBtn?.addEventListener('click', () => {
    const selectedExercise = exerciseSelect?.value;
    if (selectedExercise) {
      addExerciseToWorkout(selectedExercise);
      exerciseSelect.value = '';
    }
  });

  // Add Set buttons
  document.querySelectorAll('.add-set-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exerciseIndex = parseInt((e.target as HTMLElement).dataset.exercise || '0');
      addSetHandler(exerciseIndex);
    });
  });

  // Delete Exercise buttons
  document.querySelectorAll('.delete-exercise-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exerciseIndex = parseInt((e.target as HTMLElement).dataset.exerciseIndex || '0');
      const exerciseName = (e.target as HTMLElement).closest('[data-exercise-index]')?.querySelector('h3')?.textContent || 'this exercise';

      if (confirm(`Delete ${exerciseName}? All sets will be lost.`)) {
        deleteExerciseFromWorkout(exerciseIndex);
      }
    });
  });

  // Video Toggle buttons
  document.querySelectorAll('.video-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exerciseIndex = (e.currentTarget as HTMLElement).dataset.exerciseIndex;
      const container = document.querySelector(`.video-links-container[data-exercise-index="${exerciseIndex}"]`);
      const toggleIcon = (e.currentTarget as HTMLElement).querySelector('.toggle-icon');

      if (container && toggleIcon) {
        const isHidden = container.classList.contains('hidden');
        if (isHidden) {
          container.classList.remove('hidden');
          toggleIcon.textContent = '▼';
        } else {
          container.classList.add('hidden');
          toggleIcon.textContent = '▶';
        }
      }
    });
  });

  // Edit Links buttons
  document.querySelectorAll('.edit-links-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const exerciseIndex = parseInt((e.currentTarget as HTMLElement).dataset.exerciseIndex || '0');
      const { currentWorkout } = getState();
      const exerciseName = currentWorkout?.exercises?.[exerciseIndex]?.exerciseName;

      if (exerciseName) {
        const exerciseData = await getExerciseByName(exerciseName);
        if (exerciseData?.id) {
          await openEditLinksModal(exerciseData.id, exerciseName, true);
        }
      }
    });
  });

  // Add Links buttons
  document.querySelectorAll('.add-links-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const exerciseIndex = parseInt((e.currentTarget as HTMLElement).dataset.exerciseIndex || '0');
      const { currentWorkout } = getState();
      const exerciseName = currentWorkout?.exercises?.[exerciseIndex]?.exerciseName;

      if (exerciseName) {
        const exerciseData = await getExerciseByName(exerciseName);
        if (exerciseData?.id) {
          await openEditLinksModal(exerciseData.id, exerciseName, true);
        }
      }
    });
  });

  // Cancel Workout
  const cancelBtn = document.getElementById('cancel-workout-btn');
  cancelBtn?.addEventListener('click', () => {
    if (confirm('Cancel this workout? All progress will be lost.')) {
      stopTimer();
      stopRestTimer();
      if (timerUnsubscribe) {
        timerUnsubscribe();
        timerUnsubscribe = null;
      }
      cancelWorkout();
    }
  });

  // Complete Workout
  const completeBtn = document.getElementById('complete-workout-btn');
  completeBtn?.addEventListener('click', async () => {
    await completeWorkoutHandler();
  });

  // Rest Timer Controls
  const restTimerSkip = document.getElementById('rest-timer-skip');
  restTimerSkip?.addEventListener('click', () => {
    stopRestTimer();
  });
}

function addSetHandler(exerciseIndex: number): void {
  const inputs = document.querySelectorAll(`[data-exercise="${exerciseIndex}"]`);
  const setData: any = {};

  inputs.forEach((input: any) => {
    const field = input.dataset.field;
    if (field === 'weight') {
      setData[field] = parseFloat(input.value);
    } else {
      setData[field] = parseInt(input.value);
    }
  });

  // Get exercise type from DOM
  const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
  const exerciseType = exerciseCard?.getAttribute('data-exercise-type') || 'strength';

  const { currentWorkout } = getState();
  const currentExercise = currentWorkout?.exercises?.[exerciseIndex];
  const setNumber = (currentExercise?.sets.length || 0) + 1;

  let newSet: Set;

  // Conditional validation and set creation based on type
  if (exerciseType === 'cardio') {
    const minutes = setData.duration;
    if (!minutes || minutes <= 0) {
      alert('Please enter a duration');
      return;
    }
    newSet = {
      setNumber,
      duration: minutes * 60, // Store as seconds
    };
  } else if (exerciseType === 'bodyweight') {
    if (!setData.reps) {
      alert('Please enter reps');
      return;
    }
    newSet = {
      setNumber,
      reps: setData.reps,
      restTime: setData.restTime || 60,
    };
  } else {
    // strength
    if (!setData.weight || !setData.reps) {
      alert('Please enter weight and reps');
      return;
    }
    newSet = {
      setNumber,
      weight: setData.weight,
      reps: setData.reps,
      rpe: setData.rpe || 80,
      restTime: setData.restTime || 60,
    };
  }

  addSetToExercise(exerciseIndex, newSet);

  // Start rest timer after adding set (except for cardio)
  if (exerciseType !== 'cardio' && newSet.restTime) {
    startRestTimer(newSet.restTime);
  }
}

async function completeWorkoutHandler(): Promise<void> {
  const { currentWorkout } = getState();

  if (!currentWorkout || !currentWorkout.exercises || currentWorkout.exercises.length === 0) {
    alert('Add at least one exercise before completing');
    return;
  }

  stopTimer();
  stopRestTimer();
  if (timerUnsubscribe) {
    timerUnsubscribe();
    timerUnsubscribe = null;
  }

  // Read workout name from input
  const workoutNameInput = document.getElementById('workout-name-input') as HTMLInputElement;
  const workoutName = workoutNameInput?.value || '';

  const endTime = new Date();
  const startTime = new Date(currentWorkout.startTime!);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutes

  const workoutToSave = {
    ...currentWorkout,
    name: workoutName,
    endTime: endTime.toISOString(),
    duration,
  };

  try {
    await addWorkout(workoutToSave as any);

    // Update exercise usage
    for (const exercise of currentWorkout.exercises) {
      await incrementExerciseUsage(exercise.exerciseName);
    }

    alert(`Workout saved! 🎉\n${currentWorkout.exercises.length} exercises, ${duration} minutes`);

    // Return to home
    setState({
      currentScreen: 'home',
      currentWorkout: null,
    });
  } catch (error) {
    console.error('Error saving workout:', error);
    alert('Failed to save workout. Please try again.');
  }
}
