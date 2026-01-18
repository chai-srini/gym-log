/**
 * Edit Workout Screen - Edit past workouts
 */

import { getState, setState } from '../app-state';
import { updateWorkout, getAllExercises } from '../db';
import type { Workout, Exercise } from '../types';

export async function renderEditWorkoutScreen(): Promise<string> {
  const { currentWorkout, settings } = getState();
  const allExercises = await getAllExercises();

  if (!currentWorkout || !currentWorkout.id) {
    return '<div>Error: No workout to edit</div>';
  }

  const workout = currentWorkout as Workout;

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Header -->
      <header class="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-bold">Edit Workout</h1>
            <div class="text-sm text-blue-100">${new Date(workout.startTime).toLocaleDateString()}</div>
          </div>
          <button
            id="cancel-edit-btn"
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
            value="${workout.name || ''}"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Workout Notes -->
        <div class="mb-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <label for="workout-notes-input" class="block text-sm font-medium text-gray-700 mb-2">
            Workout Notes (Optional)
          </label>
          <textarea
            id="workout-notes-input"
            placeholder="How did the workout feel?"
            rows="2"
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${workout.notes || ''}</textarea>
        </div>

        <!-- Exercises -->
        <div id="exercises-container" class="space-y-4 mb-6">
          ${workout.exercises && workout.exercises.length > 0
            ? workout.exercises.map((ex, idx) => renderExerciseForEdit(ex, idx, settings.weightUnit)).join('')
            : `
            <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p class="text-gray-500 text-lg">No exercises</p>
            </div>
          `}
        </div>

        <!-- Add Exercise Section -->
        <div class="mb-6 bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <h3 class="font-semibold text-gray-800 mb-3">Add Exercise</h3>
          <select
            id="exercise-select"
            class="w-full p-3 border border-gray-300 rounded-lg mb-3 text-gray-800 bg-white">
            <option value="">Select an exercise...</option>
            ${allExercises.map(ex => `<option value="${ex.name}">${ex.name}</option>`).join('')}
          </select>
          <button
            id="add-exercise-btn"
            class="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
            ➕ Add Exercise
          </button>
        </div>

        <!-- Save Button -->
        <button
          id="save-changes-btn"
          class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-700 transition shadow-lg">
          💾 Save Changes
        </button>
      </main>
    </div>
  `;
}

function renderExerciseForEdit(exercise: Exercise, exerciseIndex: number, weightUnit: string): string {
  return `
    <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200" data-exercise-index="${exerciseIndex}">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-800">${exercise.exerciseName}</h3>
        <button
          class="delete-exercise-btn p-2 text-red-600 hover:bg-red-50 rounded transition"
          data-exercise-index="${exerciseIndex}">
          🗑️
        </button>
      </div>

      <!-- Exercise Notes -->
      <textarea
        class="exercise-notes-input w-full p-2 mb-3 border border-gray-300 rounded text-sm"
        data-exercise-index="${exerciseIndex}"
        placeholder="Exercise notes..."
        rows="1">${exercise.notes || ''}</textarea>

      <!-- Sets List -->
      ${exercise.sets.length > 0 ? `
        <div class="space-y-2 mb-3">
          ${exercise.sets.map((set, setIndex) => `
            <div class="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded" data-set-index="${setIndex}">
              <span class="font-medium text-gray-600 w-12">Set ${set.setNumber}</span>
              <input type="number" class="set-weight-input w-20 p-1 border rounded text-center" value="${set.weight}" placeholder="Weight">
              <span class="text-gray-500">×</span>
              <input type="number" class="set-reps-input w-16 p-1 border rounded text-center" value="${set.reps}" placeholder="Reps">
              <input type="number" class="set-rpe-input w-16 p-1 border rounded text-center" value="${set.rpe}" placeholder="RPE">
              <span class="text-xs text-gray-500">${weightUnit} • reps • RPE%</span>
              <button class="delete-set-btn ml-auto p-1 text-red-600 hover:bg-red-100 rounded text-xs" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}">
                ✕
              </button>
            </div>
          `).join('')}
        </div>
      ` : '<p class="text-sm text-gray-500 mb-3">No sets</p>'}

      <!-- Add Set Form -->
      <div class="grid grid-cols-3 gap-2">
        <input
          type="number"
          class="new-set-weight p-2 border border-gray-300 rounded text-sm"
          data-exercise="${exerciseIndex}"
          placeholder="Weight">
        <input
          type="number"
          class="new-set-reps p-2 border border-gray-300 rounded text-sm"
          data-exercise="${exerciseIndex}"
          placeholder="Reps">
        <input
          type="number"
          class="new-set-rpe p-2 border border-gray-300 rounded text-sm"
          data-exercise="${exerciseIndex}"
          placeholder="RPE%">
      </div>
      <button
        class="add-set-btn w-full mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition text-sm"
        data-exercise="${exerciseIndex}">
        + Add Set
      </button>
    </div>
  `;
}

export function attachEditWorkoutEventListeners(): void {
  const { currentWorkout } = getState();
  if (!currentWorkout) return;

  // Cancel button
  const cancelBtn = document.getElementById('cancel-edit-btn');
  cancelBtn?.addEventListener('click', () => {
    if (confirm('Discard changes?')) {
      setState({ currentScreen: 'history', currentWorkout: null });
    }
  });

  // Delete exercise buttons
  const deleteExerciseBtns = document.querySelectorAll('.delete-exercise-btn');
  deleteExerciseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const exerciseIndex = parseInt((btn as HTMLElement).dataset.exerciseIndex || '0');
      if (confirm('Delete this exercise?')) {
        const workout = getState().currentWorkout as Workout;
        workout.exercises.splice(exerciseIndex, 1);
        setState({ currentWorkout: workout });
      }
    });
  });

  // Delete set buttons
  const deleteSetBtns = document.querySelectorAll('.delete-set-btn');
  deleteSetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const exerciseIndex = parseInt((btn as HTMLElement).dataset.exerciseIndex || '0');
      const setIndex = parseInt((btn as HTMLElement).dataset.setIndex || '0');

      const workout = getState().currentWorkout as Workout;
      workout.exercises[exerciseIndex].sets.splice(setIndex, 1);

      // Re-number sets
      workout.exercises[exerciseIndex].sets.forEach((set, idx) => {
        set.setNumber = idx + 1;
      });

      setState({ currentWorkout: workout });
    });
  });

  // Update set values on change
  const setWeightInputs = document.querySelectorAll('.set-weight-input');
  const setRepsInputs = document.querySelectorAll('.set-reps-input');
  const setRpeInputs = document.querySelectorAll('.set-rpe-input');

  [setWeightInputs, setRepsInputs, setRpeInputs].forEach((inputs, fieldIndex) => {
    inputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const setDiv = target.closest('[data-set-index]');
        const exerciseDiv = target.closest('[data-exercise-index]');

        if (!setDiv || !exerciseDiv) return;

        const exerciseIndex = parseInt((exerciseDiv as HTMLElement).dataset.exerciseIndex || '0');
        const setIndex = parseInt((setDiv as HTMLElement).dataset.setIndex || '0');
        const value = parseFloat(target.value) || 0;

        const workout = getState().currentWorkout as Workout;
        const set = workout.exercises[exerciseIndex].sets[setIndex];

        if (fieldIndex === 0) set.weight = value;
        else if (fieldIndex === 1) set.reps = value;
        else if (fieldIndex === 2) set.rpe = value;

        setState({ currentWorkout: workout });
      });
    });
  });

  // Exercise notes update
  const exerciseNotesInputs = document.querySelectorAll('.exercise-notes-input');
  exerciseNotesInputs.forEach(input => {
    input.addEventListener('blur', (e) => {
      const exerciseIndex = parseInt((e.target as HTMLElement).dataset.exerciseIndex || '0');
      const notes = (e.target as HTMLTextAreaElement).value;

      const workout = getState().currentWorkout as Workout;
      workout.exercises[exerciseIndex].notes = notes;
      setState({ currentWorkout: workout });
    });
  });

  // Add exercise
  const addExerciseBtn = document.getElementById('add-exercise-btn');
  const exerciseSelect = document.getElementById('exercise-select') as HTMLSelectElement;

  addExerciseBtn?.addEventListener('click', () => {
    const selectedExercise = exerciseSelect?.value;
    if (selectedExercise) {
      const workout = getState().currentWorkout as Workout;
      workout.exercises.push({
        exerciseName: selectedExercise,
        notes: '',
        sets: [],
      });
      setState({ currentWorkout: workout });
      exerciseSelect.value = '';
    }
  });

  // Add set buttons
  const addSetBtns = document.querySelectorAll('.add-set-btn');
  addSetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const exerciseIndex = parseInt((btn as HTMLElement).dataset.exercise || '0');
      const exerciseDiv = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);

      if (!exerciseDiv) return;

      const weightInput = exerciseDiv.querySelector('.new-set-weight') as HTMLInputElement;
      const repsInput = exerciseDiv.querySelector('.new-set-reps') as HTMLInputElement;
      const rpeInput = exerciseDiv.querySelector('.new-set-rpe') as HTMLInputElement;

      const weight = parseFloat(weightInput?.value || '0');
      const reps = parseInt(repsInput?.value || '0');
      const rpe = parseInt(rpeInput?.value || '80');

      if (!weight || !reps) {
        alert('Please enter weight and reps');
        return;
      }

      const workout = getState().currentWorkout as Workout;
      const setNumber = workout.exercises[exerciseIndex].sets.length + 1;

      workout.exercises[exerciseIndex].sets.push({
        setNumber,
        weight,
        reps,
        rpe,
        restTime: 60, // Default rest time
      });

      setState({ currentWorkout: workout });

      // Clear inputs
      if (weightInput) weightInput.value = '';
      if (repsInput) repsInput.value = '';
      if (rpeInput) rpeInput.value = '';
    });
  });

  // Save changes button
  const saveBtn = document.getElementById('save-changes-btn');
  saveBtn?.addEventListener('click', async () => {
    const workout = getState().currentWorkout as Workout;

    // Get updated name and notes from inputs
    const nameInput = document.getElementById('workout-name-input') as HTMLInputElement;
    const notesInput = document.getElementById('workout-notes-input') as HTMLTextAreaElement;

    workout.name = nameInput?.value || '';
    workout.notes = notesInput?.value || '';

    if (!workout.exercises || workout.exercises.length === 0) {
      alert('Add at least one exercise before saving');
      return;
    }

    try {
      await updateWorkout(workout);
      alert('Workout updated successfully! ✓');
      setState({ currentScreen: 'history', currentWorkout: null });
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout. Please try again.');
    }
  });
}
