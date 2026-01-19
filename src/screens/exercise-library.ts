/**
 * Exercise Library Screen
 */

import { setState } from '../app-state';
import { getAllExercises, addExercise, deleteExercise } from '../db';
import { STARTER_EXERCISES } from '../types';
import type { ExerciseLibraryItem, ExerciseCategory } from '../types';
import { openEditLinksModal } from '../utils/edit-links-modal';

const STARTER_EXERCISE_NAMES = STARTER_EXERCISES.map(ex => ex.name);

export async function renderExerciseLibraryScreen(): Promise<string> {
  const exercises = await getAllExercises();

  // Sort by usage (most used first), then alphabetically
  const sortedExercises = exercises.sort((a, b) => {
    if (b.useCount !== a.useCount) {
      return b.useCount - a.useCount;
    }
    return a.name.localeCompare(b.name);
  });

  const categories: ExerciseCategory[] = ['Push', 'Pull', 'Legs', 'Arms', 'Core', 'Other'];

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center p-4">
          <button
            id="back-to-home-btn"
            class="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition min-h-touch tap-highlight-transparent">
            ← Back
          </button>
          <h1 class="text-xl font-bold text-gray-900 ml-2">Exercise Library</h1>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <!-- Search Bar -->
        <div class="mb-4">
          <input
            id="exercise-search"
            type="text"
            placeholder="🔍 Search exercises..."
            class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>

        <!-- Category Filter -->
        <div class="mb-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div class="flex items-center gap-2 overflow-x-auto">
            <span class="text-sm text-gray-600 font-medium whitespace-nowrap">Filter:</span>
            <button
              class="category-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-blue-600 text-white"
              data-category="All">
              All
            </button>
            ${categories.map(cat => `
              <button
                class="category-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                data-category="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Add Custom Exercise -->
        <div class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-gray-800 mb-3">Add Custom Exercise</h3>
          <div class="flex flex-col gap-2">
            <input
              id="new-exercise-input"
              type="text"
              placeholder="Exercise name..."
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div class="flex gap-2">
              <select
                id="new-exercise-category"
                class="flex-1 p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
              <button
                id="add-exercise-btn"
                class="py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition min-h-touch tap-highlight-transparent whitespace-nowrap">
                ➕ Add
              </button>
            </div>
            <details class="mt-2">
              <summary class="text-sm text-gray-600 cursor-pointer hover:text-gray-800 font-medium">+ Add video link (optional)</summary>
              <div class="mt-3 space-y-2 pl-2">
                <input
                  id="new-exercise-link-title"
                  type="text"
                  placeholder="Video title (e.g., 'Form Tutorial')"
                  class="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <input
                  id="new-exercise-link-url"
                  type="url"
                  placeholder="Video URL (e.g., https://youtube.com/...)"
                  class="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </details>
          </div>
        </div>

        <!-- Exercise Stats -->
        <div class="mb-4 text-sm text-gray-600">
          <span class="font-medium">${exercises.length} exercises</span>
          <span class="text-gray-400">•</span>
          <span>${exercises.filter(ex => !STARTER_EXERCISE_NAMES.includes(ex.name)).length} custom</span>
        </div>

        <!-- Exercise List -->
        <div id="exercise-list" class="space-y-2">
          ${sortedExercises.map(exercise => renderExerciseCard(exercise)).join('')}
        </div>

        ${sortedExercises.length === 0 ? `
          <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p class="text-gray-500">No exercises found</p>
            <p class="text-sm text-gray-400 mt-1">Add your first custom exercise above!</p>
          </div>
        ` : ''}
      </main>
    </div>
  `;
}

function renderExerciseCard(exercise: ExerciseLibraryItem): string {
  const isCustom = !STARTER_EXERCISE_NAMES.includes(exercise.name);
  const lastUsedDate = exercise.lastUsed ? new Date(exercise.lastUsed).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) : 'Never';

  // Category badge colors
  const categoryColors: Record<ExerciseCategory, string> = {
    'Push': 'bg-red-100 text-red-700',
    'Pull': 'bg-blue-100 text-blue-700',
    'Legs': 'bg-green-100 text-green-700',
    'Arms': 'bg-purple-100 text-purple-700',
    'Core': 'bg-yellow-100 text-yellow-700',
    'Other': 'bg-gray-100 text-gray-700',
  };

  const links = exercise.links || [];
  const hasLinks = links.length > 0;

  return `
    <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition exercise-card" data-exercise-name="${exercise.name.toLowerCase()}" data-category="${exercise.category}">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-semibold text-gray-900">${exercise.name}</h3>
            <span class="text-xs ${categoryColors[exercise.category]} px-2 py-1 rounded">${exercise.category}</span>
            ${isCustom ? '<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Custom</span>' : ''}
          </div>
          <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>Used ${exercise.useCount} time${exercise.useCount !== 1 ? 's' : ''}</span>
            ${exercise.useCount > 0 ? `<span>•</span><span>Last: ${lastUsedDate}</span>` : ''}
          </div>
        </div>
        ${isCustom ? `
          <button
            data-exercise-id="${exercise.id}"
            class="delete-exercise-btn ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition min-h-touch tap-highlight-transparent">
            🗑️
          </button>
        ` : `
          <span class="text-2xl ml-3">💪</span>
        `}
      </div>

      ${hasLinks ? `
        <div class="mt-3 border-t border-gray-100 pt-3">
          <button
            class="toggle-videos-btn w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
            data-exercise-id="${exercise.id}">
            <span class="toggle-icon">▶</span>
            <span>📹 Videos (${links.length})</span>
          </button>
          <div class="videos-content hidden mt-2 space-y-2 pl-6">
            ${links.map(link => `
              <a
                href="${escapeHtml(link.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline">
                <span>🎥</span>
                <span class="flex-1 truncate">${escapeHtml(link.title)}</span>
                <span class="text-xs">↗</span>
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mt-3 border-t border-gray-100 pt-3">
        <button
          data-exercise-id="${exercise.id}"
          class="edit-links-btn w-full py-2 px-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 transition text-sm min-h-touch tap-highlight-transparent">
          📹 Edit Video Links
        </button>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function attachExerciseLibraryEventListeners(): void {
  // Back button
  const backBtn = document.getElementById('back-to-home-btn');
  backBtn?.addEventListener('click', () => {
    setState({ currentScreen: 'home' });
  });

  // Category filter functionality
  let activeCategory = 'All';
  const categoryButtons = document.querySelectorAll('.category-filter-btn');
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = (btn as HTMLElement).getAttribute('data-category') || 'All';
      activeCategory = category;

      // Update button styles
      categoryButtons.forEach((b) => {
        if (b === btn) {
          b.className = 'category-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-blue-600 text-white';
        } else {
          b.className = 'category-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
      });

      // Filter exercises
      filterExercises();
    });
  });

  // Search functionality
  const searchInput = document.getElementById('exercise-search') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    filterExercises();
  });

  // Combined filter function for search and category
  function filterExercises(): void {
    const query = searchInput?.value.toLowerCase() || '';
    const exerciseCards = document.querySelectorAll('.exercise-card');

    exerciseCards.forEach((card) => {
      const exerciseName = (card as HTMLElement).getAttribute('data-exercise-name') || '';
      const exerciseCategory = (card as HTMLElement).getAttribute('data-category') || '';

      const matchesSearch = exerciseName.includes(query);
      const matchesCategory = activeCategory === 'All' || exerciseCategory === activeCategory;

      if (matchesSearch && matchesCategory) {
        (card as HTMLElement).style.display = '';
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });
  }

  // Add custom exercise
  const addBtn = document.getElementById('add-exercise-btn');
  const newExerciseInput = document.getElementById('new-exercise-input') as HTMLInputElement;
  const newExerciseCategory = document.getElementById('new-exercise-category') as HTMLSelectElement;

  addBtn?.addEventListener('click', async () => {
    await addCustomExerciseHandler(newExerciseInput, newExerciseCategory);
  });

  // Allow pressing Enter in the input field
  newExerciseInput?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      await addCustomExerciseHandler(newExerciseInput, newExerciseCategory);
    }
  });

  // Delete custom exercises
  const deleteButtons = document.querySelectorAll('.delete-exercise-btn');
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const exerciseId = (btn as HTMLElement).getAttribute('data-exercise-id');
      if (!exerciseId) return;

      if (confirm('Delete this custom exercise? This cannot be undone.')) {
        try {
          await deleteExercise(Number(exerciseId));
          // Re-render the screen
          setState({ currentScreen: 'exercise-library' });
        } catch (error) {
          console.error('Error deleting exercise:', error);
          alert('Failed to delete exercise. Please try again.');
        }
      }
    });
  });

  // Toggle video section
  const toggleVideoButtons = document.querySelectorAll('.toggle-videos-btn');
  toggleVideoButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.exercise-card');
      const videosContent = card?.querySelector('.videos-content');
      const toggleIcon = btn.querySelector('.toggle-icon');

      if (videosContent && toggleIcon) {
        const isHidden = videosContent.classList.contains('hidden');
        if (isHidden) {
          videosContent.classList.remove('hidden');
          toggleIcon.textContent = '▼';
        } else {
          videosContent.classList.add('hidden');
          toggleIcon.textContent = '▶';
        }
      }
    });
  });

  // Edit video links buttons
  const editLinksButtons = document.querySelectorAll('.edit-links-btn');
  editLinksButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const exerciseId = (btn as HTMLElement).getAttribute('data-exercise-id');
      if (!exerciseId) return;

      const card = btn.closest('.exercise-card');
      const exerciseName = card?.querySelector('h3')?.textContent?.trim() || 'Exercise';

      await openEditLinksModal(Number(exerciseId), exerciseName, false);
    });
  });
}

async function addCustomExerciseHandler(input: HTMLInputElement, categorySelect: HTMLSelectElement): Promise<void> {
  const exerciseName = input?.value.trim();
  const category = categorySelect?.value || 'Other';

  if (!exerciseName) {
    alert('Please enter an exercise name');
    return;
  }

  // Check if exercise already exists
  const allExercises = await getAllExercises();
  const exists = allExercises.some(ex =>
    ex.name.toLowerCase() === exerciseName.toLowerCase()
  );

  if (exists) {
    alert('This exercise already exists in your library');
    return;
  }

  // Get optional video link inputs
  const linkTitleInput = document.getElementById('new-exercise-link-title') as HTMLInputElement;
  const linkUrlInput = document.getElementById('new-exercise-link-url') as HTMLInputElement;
  const linkTitle = linkTitleInput?.value.trim();
  const linkUrl = linkUrlInput?.value.trim();

  // Validate link if provided
  if ((linkTitle || linkUrl) && (!linkTitle || !linkUrl)) {
    alert('Please provide both title and URL for the video link, or leave both empty');
    return;
  }

  // Validate URL format if provided
  if (linkUrl) {
    try {
      new URL(linkUrl);
    } catch {
      alert('Please enter a valid URL (must start with http:// or https://)');
      return;
    }
  }

  try {
    const exerciseId = await addExercise(exerciseName, category);

    // If link was provided, add it to the exercise
    if (linkTitle && linkUrl && exerciseId) {
      const { updateExerciseLinks } = await import('../db');
      await updateExerciseLinks(exerciseId, [{ title: linkTitle, url: linkUrl }]);
    }

    input.value = '';
    if (linkTitleInput) linkTitleInput.value = '';
    if (linkUrlInput) linkUrlInput.value = '';

    // Re-render the screen
    setState({ currentScreen: 'exercise-library' });
  } catch (error) {
    console.error('Error adding exercise:', error);
    alert('Failed to add exercise. Please try again.');
  }
}
