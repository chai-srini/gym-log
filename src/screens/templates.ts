/**
 * Workout Templates Screen
 */

import { setState } from '../app-state';
import { getAllTemplates, deleteTemplate } from '../db';
import { startWorkoutFromTemplate } from '../app-state';
import type { WorkoutTemplate } from '../types';

export async function renderTemplatesScreen(): Promise<string> {
  const templates = await getAllTemplates();

  // Sort by usage (most used first), then alphabetically
  const sortedTemplates = templates.sort((a, b) => {
    if (b.useCount !== a.useCount) {
      return b.useCount - a.useCount;
    }
    return a.name.localeCompare(b.name);
  });

  const starterCount = templates.filter(t => t.isStarter).length;
  const customCount = templates.filter(t => !t.isStarter).length;

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center p-4">
          <button
            id="back-to-home-btn"
            class="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition min-h-touch tap-highlight-transparent">
            ← Back
          </button>
          <h1 class="text-xl font-bold text-gray-900 ml-2">Workout Templates</h1>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <!-- Filter Buttons -->
        <div class="mb-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div class="flex items-center gap-2 overflow-x-auto">
            <span class="text-sm text-gray-600 font-medium whitespace-nowrap">Filter:</span>
            <button
              class="template-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-blue-600 text-white"
              data-filter="All">
              All
            </button>
            <button
              class="template-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-filter="Starter">
              Starter (${starterCount})
            </button>
            <button
              class="template-filter-btn px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-filter="Custom">
              Custom (${customCount})
            </button>
          </div>
        </div>

        <!-- Template Stats -->
        <div class="mb-4 text-sm text-gray-600">
          <span class="font-medium">${templates.length} templates</span>
          <span class="text-gray-400">•</span>
          <span>${starterCount} starter</span>
          <span class="text-gray-400">•</span>
          <span>${customCount} custom</span>
        </div>

        ${sortedTemplates.length === 0 ? `
          <div class="text-center py-12">
            <div class="text-6xl mb-4">📋</div>
            <p class="text-gray-600 text-lg mb-2">No templates yet</p>
            <p class="text-gray-500 text-sm">Save a workout from History to create your first template</p>
          </div>
        ` : `
          <!-- Template List -->
          <div id="template-list" class="space-y-3">
            ${sortedTemplates.map(template => renderTemplateCard(template)).join('')}
          </div>
        `}
      </main>

      <footer class="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <button
          id="back-to-home-footer-btn"
          class="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-800 transition min-h-touch tap-highlight-transparent">
          ← Back to Home
        </button>
      </footer>
    </div>
  `;
}

function renderTemplateCard(template: WorkoutTemplate): string {
  const usageText = template.useCount > 0
    ? `<span class="text-xs text-gray-500">Used ${template.useCount}x</span>`
    : '';

  const templateType = template.isStarter
    ? '<span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Starter</span>'
    : '<span class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Custom</span>';

  return `
    <div
      class="template-card bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition"
      data-template-id="${template.id}"
      data-is-starter="${template.isStarter}">
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 text-lg">${template.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${template.description}</p>
        </div>
        ${templateType}
      </div>

      <div class="mt-3 mb-3">
        <div class="text-sm text-gray-700">
          <span class="font-medium">${template.exercises.length} exercises:</span>
          <span class="text-gray-600">${template.exercises.join(', ')}</span>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <button
          class="use-template-btn flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition min-h-touch tap-highlight-transparent"
          data-template-id="${template.id}">
          ⚡ Use Template
        </button>
        ${!template.isStarter ? `
          <button
            class="delete-template-btn py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:bg-red-800 transition min-h-touch tap-highlight-transparent"
            data-template-id="${template.id}"
            data-template-name="${template.name}">
            🗑️
          </button>
        ` : ''}
        ${usageText ? `<span class="ml-2">${usageText}</span>` : ''}
      </div>
    </div>
  `;
}

export function attachTemplatesEventListeners(): void {
  // Back to home buttons
  const backBtns = document.querySelectorAll('#back-to-home-btn, #back-to-home-footer-btn');
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ currentScreen: 'home' });
    });
  });

  // Filter buttons
  const filterBtns = document.querySelectorAll('.template-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const filter = target.dataset.filter || 'All';

      // Update button styles
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
      });
      target.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
      target.classList.add('bg-blue-600', 'text-white');

      // Filter templates
      filterTemplates(filter);
    });
  });

  // Use template buttons
  const useTemplateBtns = document.querySelectorAll('.use-template-btn');
  useTemplateBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const templateId = parseInt(target.dataset.templateId || '0', 10);

      if (templateId) {
        try {
          const { getTemplate } = await import('../db');
          const template = await getTemplate(templateId);
          if (template) {
            startWorkoutFromTemplate(template);
          }
        } catch (error) {
          console.error('Failed to load template:', error);
          alert('Failed to load template. Please try again.');
        }
      }
    });
  });

  // Delete template buttons
  const deleteTemplateBtns = document.querySelectorAll('.delete-template-btn');
  deleteTemplateBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const templateId = parseInt(target.dataset.templateId || '0', 10);
      const templateName = target.dataset.templateName || 'this template';

      if (templateId && confirm(`Delete "${templateName}"?\n\nThis action cannot be undone.`)) {
        try {
          await deleteTemplate(templateId);
          // Re-render the screen
          const html = await renderTemplatesScreen();
          const app = document.getElementById('app');
          if (app) {
            app.innerHTML = html;
            attachTemplatesEventListeners();
          }
        } catch (error) {
          console.error('Failed to delete template:', error);
          alert('Failed to delete template. Please try again.');
        }
      }
    });
  });
}

function filterTemplates(filter: string): void {
  const templateCards = document.querySelectorAll('.template-card');

  templateCards.forEach(card => {
    const htmlCard = card as HTMLElement;
    const isStarter = htmlCard.dataset.isStarter === 'true';

    let show = true;
    if (filter === 'Starter') {
      show = isStarter;
    } else if (filter === 'Custom') {
      show = !isStarter;
    }

    if (show) {
      htmlCard.style.display = 'block';
    } else {
      htmlCard.style.display = 'none';
    }
  });
}
