/**
 * Edit Links Modal Utility
 * Modal component for managing exercise video links
 */

import { getExerciseById, updateExerciseLinks } from '../db';
import { setState, getState } from '../app-state';
import type { ExerciseVideoLink } from '../types';

export async function openEditLinksModal(
  exerciseId: number,
  exerciseName: string,
  fromWorkout: boolean = false
): Promise<void> {
  const exercise = await getExerciseById(exerciseId);
  if (!exercise) return;

  const links = exercise.links || [];

  const modalHtml = `
    <div id="edit-links-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Edit Video Links</h2>
            <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
          <p class="text-sm text-gray-600 mt-1">Exercise: <span class="font-semibold">${exerciseName}</span></p>
        </div>

        <div class="p-4">
          <div id="links-list" class="space-y-3 mb-4">
            ${links.length === 0 ? '<p class="text-sm text-gray-500 italic">No video links yet</p>' : ''}
            ${links.map((link, index) => renderLinkItem(link, index)).join('')}
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Add New Link</h3>
            <div class="space-y-2">
              <input
                id="new-link-title"
                type="text"
                placeholder="Link title (e.g., 'Form Tutorial by Jeff Nippard')"
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <input
                id="new-link-url"
                type="url"
                placeholder="Video URL (e.g., https://youtube.com/...)"
                class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <button
                id="add-link-btn"
                class="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition min-h-touch tap-highlight-transparent">
                + Add Link
              </button>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-2">
          <button
            id="save-links-btn"
            class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition min-h-touch tap-highlight-transparent">
            💾 Save Changes
          </button>
          <button
            id="cancel-modal-btn"
            class="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-800 transition min-h-touch tap-highlight-transparent">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  // Add modal to DOM
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);

  // Attach event listeners
  attachModalEventListeners(exerciseId, exerciseName, links, fromWorkout, modalContainer);
}

function renderLinkItem(link: ExerciseVideoLink, index: number): string {
  return `
    <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200" data-link-index="${index}">
      <div class="flex-1 min-w-0">
        <div class="font-medium text-gray-900 text-sm truncate">${escapeHtml(link.title)}</div>
        <a
          href="${escapeHtml(link.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-blue-600 hover:underline truncate block">
          ${escapeHtml(link.url)}
        </a>
      </div>
      <button
        class="delete-link-btn p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition flex-shrink-0 min-h-touch tap-highlight-transparent"
        data-link-index="${index}"
        title="Delete link">
        🗑️
      </button>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function attachModalEventListeners(
  exerciseId: number,
  _exerciseName: string,
  initialLinks: ExerciseVideoLink[],
  fromWorkout: boolean,
  modalContainer: HTMLElement
): void {
  let currentLinks = [...initialLinks];

  const closeModal = () => {
    modalContainer.remove();
  };

  // Close button
  const closeBtns = modalContainer.querySelectorAll('#close-modal-btn, #cancel-modal-btn');
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Click outside to close
  const modal = modalContainer.querySelector('#edit-links-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Add new link
  const addLinkBtn = modalContainer.querySelector('#add-link-btn');
  const titleInput = modalContainer.querySelector('#new-link-title') as HTMLInputElement;
  const urlInput = modalContainer.querySelector('#new-link-url') as HTMLInputElement;

  const addLink = () => {
    const title = titleInput?.value.trim();
    const url = urlInput?.value.trim();

    if (!title || !url) {
      alert('Please enter both title and URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    currentLinks.push({ title, url });

    // Re-render links list
    const linksList = modalContainer.querySelector('#links-list');
    if (linksList) {
      linksList.innerHTML = currentLinks.map((link, index) => renderLinkItem(link, index)).join('');
      attachDeleteListeners();
    }

    // Clear inputs
    titleInput.value = '';
    urlInput.value = '';
    titleInput.focus();
  };

  addLinkBtn?.addEventListener('click', addLink);

  // Enter key in URL field adds link
  urlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLink();
    }
  });

  // Delete link buttons
  function attachDeleteListeners() {
    const deleteBtns = modalContainer.querySelectorAll('.delete-link-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const linkIndex = parseInt((btn as HTMLElement).dataset.linkIndex || '0');
        if (confirm(`Delete "${currentLinks[linkIndex].title}"?\n\nThis action cannot be undone.`)) {
          currentLinks.splice(linkIndex, 1);

          const linksList = modalContainer.querySelector('#links-list');
          if (linksList) {
            if (currentLinks.length === 0) {
              linksList.innerHTML = '<p class="text-sm text-gray-500 italic">No video links yet</p>';
            } else {
              linksList.innerHTML = currentLinks.map((link, index) => renderLinkItem(link, index)).join('');
              attachDeleteListeners();
            }
          }
        }
      });
    });
  }
  attachDeleteListeners();

  // Save changes
  const saveLinksBtn = modalContainer.querySelector('#save-links-btn');
  saveLinksBtn?.addEventListener('click', async () => {
    try {
      await updateExerciseLinks(exerciseId, currentLinks);
      alert('Video links saved successfully!');
      closeModal();
      document.removeEventListener('keydown', handleEscape);

      // Trigger re-render of current screen
      if (fromWorkout) {
        // Re-render workout screen while maintaining state
        const state = getState();
        setState({ ...state });
      } else {
        // Re-render exercise library
        setState({ currentScreen: 'exercise-library' });
      }
    } catch (error) {
      console.error('Error saving links:', error);
      alert('Failed to save links. Please try again.');
    }
  });
}
