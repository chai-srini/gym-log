import { getAllWorkouts, getWorkout, deleteWorkout, createTemplateFromWorkout, getExerciseByName } from '../db';
import { setState, quickStartWorkout, getState } from '../app-state';
import type { Workout, ExerciseLibraryItem } from '../types';

export async function renderHistoryScreen(): Promise<string> {
  const workouts = await getAllWorkouts();

  // Fetch exercise library data for all exercises in all workouts
  const exerciseDataMap = new Map<string, ExerciseLibraryItem>();
  const allExerciseNames = new Set<string>();
  workouts.forEach(workout => {
    workout.exercises.forEach(ex => allExerciseNames.add(ex.exerciseName));
  });

  const exerciseDataPromises = Array.from(allExerciseNames).map(name =>
    getExerciseByName(name)
  );
  const exerciseDataResults = await Promise.all(exerciseDataPromises);
  Array.from(allExerciseNames).forEach((name, idx) => {
    const data = exerciseDataResults[idx];
    if (data) {
      exerciseDataMap.set(name, data);
    }
  });

  if (workouts.length === 0) {
    return `
      <div class="min-h-screen flex flex-col bg-gray-50">
        <header class="bg-white shadow-sm sticky top-0 z-10">
          <div class="flex items-center p-4">
            <button
              id="back-to-home-btn"
              class="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition min-h-touch tap-highlight-transparent">
              ← Back
            </button>
            <h1 class="text-xl font-bold text-gray-900 ml-2">Workout History</h1>
          </div>
        </header>

        <main class="flex-1 p-4">
          <div class="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-xl text-gray-500 font-semibold">No Workout History</p>
            <p class="text-sm text-gray-400 mt-2">Complete your first workout to see it here!</p>
            <button
              id="empty-home-btn"
              class="mt-6 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium min-h-touch tap-highlight-transparent">
              Go to Home
            </button>
          </div>
        </main>
      </div>
    `;
  }

  const workoutCards = workouts.map((workout) => renderWorkoutCard(workout, exerciseDataMap)).join('');

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center p-4">
          <button
            id="back-to-home-btn"
            class="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition min-h-touch tap-highlight-transparent">
            ← Back
          </button>
          <h1 class="text-xl font-bold text-gray-900 ml-2">Workout History</h1>
        </div>
      </header>

      <main class="flex-1 p-4">
        <div class="space-y-3">
          ${workoutCards}
        </div>
      </main>
    </div>
  `;
}

function renderWorkoutCard(workout: Workout, exerciseDataMap: Map<string, ExerciseLibraryItem>): string {
  const exerciseCount = workout.exercises.length;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const date = new Date(workout.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const duration = workout.duration ? `${workout.duration} min` : 'N/A';

  // Extract exercise names for display
  const exerciseNames = workout.exercises.map((ex) => ex.exerciseName).join(', ');
  const exerciseDisplay =
    exerciseNames.length > 50 ? exerciseNames.substring(0, 47) + '...' : exerciseNames;

  return `
    <div class="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200">
      <button
        data-workout-id="${workout.id}"
        class="workout-card-toggle w-full text-left p-4 min-h-touch tap-highlight-transparent active:bg-gray-50 transition">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            ${workout.name ? `
              <p class="font-bold text-gray-900 text-base">${workout.name}</p>
              <p class="text-sm text-gray-500 mt-0.5">${date}</p>
            ` : `
              <p class="font-semibold text-gray-900 text-base">${date}</p>
            `}
            <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>${totalSets} set${totalSets !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>${duration}</span>
            </div>
            ${exerciseNames ? `<p class="text-sm text-gray-700 mt-2">${exerciseDisplay}</p>` : ''}
            ${workout.notes ? `<p class="text-sm text-gray-500 italic mt-1">${workout.notes}</p>` : ''}
          </div>
          <div class="flex flex-col items-center ml-3">
            <span class="text-2xl">💪</span>
            <span class="expand-indicator text-gray-400 text-xs mt-1">▼</span>
          </div>
        </div>
      </button>

      <div data-workout-details="${workout.id}" class="workout-details hidden border-t border-gray-200 p-4 bg-gray-50">
        ${renderWorkoutDetails(workout, exerciseDataMap)}
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            data-quick-start-id="${workout.id}"
            class="quick-start-btn py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition font-medium min-h-touch tap-highlight-transparent">
            ⚡ Quick Start
          </button>
          <button
            data-edit-workout-id="${workout.id}"
            class="edit-workout-btn py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-medium min-h-touch tap-highlight-transparent">
            ✏️ Edit
          </button>
          <button
            data-save-template-id="${workout.id}"
            class="save-template-btn py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition font-medium min-h-touch tap-highlight-transparent col-span-2">
            💾 Save as Template
          </button>
        </div>
        <button
          data-delete-workout-id="${workout.id}"
          class="delete-workout-btn w-full mt-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition font-medium min-h-touch tap-highlight-transparent">
          🗑️ Delete Workout
        </button>
      </div>
    </div>
  `;
}

function renderWorkoutDetails(workout: Workout, exerciseDataMap: Map<string, ExerciseLibraryItem>): string {
  if (workout.exercises.length === 0) {
    return '<p class="text-sm text-gray-500 italic">No exercises recorded</p>';
  }

  const { settings } = getState();

  return workout.exercises
    .map(
      (exercise) => {
        const exerciseData = exerciseDataMap.get(exercise.exerciseName);
        const exerciseType = exerciseData?.type || 'strength';

        return `
    <div class="mb-4 last:mb-0">
      <h3 class="font-semibold text-gray-900 mb-2">${exercise.exerciseName}</h3>
      ${exercise.notes ? `<p class="text-sm text-gray-600 italic mb-2">${exercise.notes}</p>` : ''}
      <div class="space-y-1">
        ${exercise.sets
          .map(
            (set, idx) => {
              if (exerciseType === 'cardio') {
                const minutes = Math.round((set.duration || 0) / 60);
                return `
          <div class="text-sm text-gray-700 flex items-center">
            <span class="font-medium text-gray-500 w-20">Activity:</span>
            <span class="font-semibold">Duration: ${minutes} min</span>
          </div>
        `;
              } else if (exerciseType === 'bodyweight') {
                return `
          <div class="text-sm text-gray-700 flex items-center">
            <span class="font-medium text-gray-500 w-12">Set ${idx + 1}:</span>
            <span class="font-semibold">${set.reps} reps</span>
            <span class="text-gray-500 ml-2">(Rest ${set.restTime}s)</span>
          </div>
        `;
              } else {
                // strength
                return `
          <div class="text-sm text-gray-700 flex items-center">
            <span class="font-medium text-gray-500 w-12">Set ${idx + 1}:</span>
            <span class="font-semibold">${set.weight} ${settings.weightUnit} × ${set.reps} reps</span>
            <span class="text-gray-500 ml-2">(RPE ${set.rpe}%, Rest ${set.restTime}s)</span>
          </div>
        `;
              }
            }
          )
          .join('')}
      </div>
    </div>
  `;
      }
    )
    .join('');
}

export function attachHistoryEventListeners(): void {
  // Back button
  const backBtn = document.getElementById('back-to-home-btn');
  backBtn?.addEventListener('click', () => {
    setState({ currentScreen: 'home' });
  });

  // Empty state home button
  const emptyHomeBtn = document.getElementById('empty-home-btn');
  emptyHomeBtn?.addEventListener('click', () => {
    setState({ currentScreen: 'home' });
  });

  // Workout card expansion toggles
  const toggleButtons = document.querySelectorAll('.workout-card-toggle');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const workoutId = (button as HTMLElement).getAttribute('data-workout-id');
      if (!workoutId) return;

      const detailsSection = document.querySelector(`[data-workout-details="${workoutId}"]`);
      const expandIndicator = button.querySelector('.expand-indicator');

      if (detailsSection && expandIndicator) {
        const isHidden = detailsSection.classList.contains('hidden');
        if (isHidden) {
          detailsSection.classList.remove('hidden');
          expandIndicator.textContent = '▲';
        } else {
          detailsSection.classList.add('hidden');
          expandIndicator.textContent = '▼';
        }
      }
    });
  });

  // Quick Start buttons
  const quickStartButtons = document.querySelectorAll('.quick-start-btn');
  quickStartButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent card expansion
      const workoutId = (button as HTMLElement).getAttribute('data-quick-start-id');
      if (!workoutId) return;

      const workout = await getWorkout(Number(workoutId));
      if (workout) {
        quickStartWorkout(workout);
      }
    });
  });

  // Edit workout buttons
  const editButtons = document.querySelectorAll('.edit-workout-btn');
  editButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const workoutId = (button as HTMLElement).getAttribute('data-edit-workout-id');
      if (!workoutId) return;

      const workout = await getWorkout(Number(workoutId));
      if (workout) {
        setState({
          currentScreen: 'edit-workout',
          currentWorkout: workout
        });
      }
    });
  });

  // Save as Template buttons
  const saveTemplateButtons = document.querySelectorAll('.save-template-btn');
  saveTemplateButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const workoutId = (button as HTMLElement).getAttribute('data-save-template-id');
      if (!workoutId) return;

      const workout = await getWorkout(Number(workoutId));
      if (!workout) return;

      // Prompt for template name (default to workout name or "My Template")
      const defaultName = workout.name || 'My Template';
      const templateName = prompt('Enter template name:', defaultName);
      if (!templateName || templateName.trim() === '') return;

      // Prompt for template description
      const templateDescription = prompt(
        'Enter template description (optional):',
        `${workout.exercises.length} exercises`
      );

      try {
        await createTemplateFromWorkout(
          workout,
          templateName.trim(),
          templateDescription?.trim() || ''
        );
        alert(`Template "${templateName}" created successfully!`);
      } catch (error) {
        console.error('Error creating template:', error);
        alert('Failed to create template. Please try again.');
      }
    });
  });

  // Delete workout buttons
  const deleteButtons = document.querySelectorAll('.delete-workout-btn');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const workoutId = (button as HTMLElement).getAttribute('data-delete-workout-id');
      if (!workoutId) return;

      const confirmed = confirm(
        'Are you sure you want to delete this workout?\n\nThis action cannot be undone.'
      );

      if (confirmed) {
        try {
          await deleteWorkout(Number(workoutId));
          // Refresh the history screen
          setState({ currentScreen: 'history' });
        } catch (error) {
          console.error('Error deleting workout:', error);
          alert('Failed to delete workout. Please try again.');
        }
      }
    });
  });
}
