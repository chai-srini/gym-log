import { getState, setState, updateSettings } from '../app-state';
import { clearAllData } from '../db';

export async function renderSettingsScreen(): Promise<string> {
  const { settings } = getState();

  return `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center p-4">
          <button
            id="back-to-home-btn"
            class="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition min-h-touch tap-highlight-transparent">
            ← Back
          </button>
          <h1 class="text-xl font-bold text-gray-900 ml-2">Settings</h1>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div class="space-y-4">
          <!-- Weight Unit Setting -->
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Weight Unit
            </label>
            <div class="flex gap-2">
              <button
                id="unit-lbs-btn"
                data-unit="lbs"
                class="flex-1 py-3 px-4 rounded-lg font-medium transition min-h-touch tap-highlight-transparent ${
                  settings.weightUnit === 'lbs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }">
                lbs (Pounds)
              </button>
              <button
                id="unit-kg-btn"
                data-unit="kg"
                class="flex-1 py-3 px-4 rounded-lg font-medium transition min-h-touch tap-highlight-transparent ${
                  settings.weightUnit === 'kg'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }">
                kg (Kilograms)
              </button>
            </div>
          </div>

          <!-- Default RPE Setting -->
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <label for="rpe-slider" class="block text-sm font-semibold text-gray-900 mb-2">
              Default RPE (Rate of Perceived Exertion)
            </label>
            <div class="flex items-center gap-4">
              <input
                id="rpe-slider"
                type="range"
                min="1"
                max="100"
                step="1"
                value="${settings.defaultRPE}"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
              <span id="rpe-value" class="text-2xl font-bold text-blue-600 w-16 text-right">${settings.defaultRPE}%</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">Default intensity level for new sets</p>
          </div>

          <!-- Default Rest Time Setting -->
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <label for="rest-input" class="block text-sm font-semibold text-gray-900 mb-2">
              Default Rest Time (seconds)
            </label>
            <input
              id="rest-input"
              type="number"
              min="10"
              max="600"
              step="5"
              value="${settings.defaultRestTime}"
              class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <p class="text-xs text-gray-500 mt-2">Default rest period between sets</p>
          </div>

          <!-- Save Button -->
          <button
            id="save-settings-btn"
            class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition min-h-touch tap-highlight-transparent shadow-md">
            💾 Save Settings
          </button>

          <!-- Danger Zone -->
          <div class="bg-red-50 rounded-lg p-4 border border-red-200 mt-8">
            <h3 class="text-sm font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p class="text-xs text-red-700 mb-3">This action cannot be undone</p>
            <button
              id="clear-all-data-btn"
              class="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition min-h-touch tap-highlight-transparent">
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function attachSettingsEventListeners(): void {
  // Back button
  const backBtn = document.getElementById('back-to-home-btn');
  backBtn?.addEventListener('click', () => {
    setState({ currentScreen: 'home' });
  });

  // Weight unit toggle buttons
  const unitButtons = document.querySelectorAll('[data-unit]');
  unitButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const unit = (btn as HTMLElement).getAttribute('data-unit') as 'lbs' | 'kg';
      updateSettings({ weightUnit: unit });
    });
  });

  // RPE slider - live update display
  const rpeSlider = document.getElementById('rpe-slider') as HTMLInputElement;
  const rpeValue = document.getElementById('rpe-value');
  rpeSlider?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    if (rpeValue) {
      rpeValue.textContent = `${value}%`;
    }
  });

  // Save Settings button
  const saveBtn = document.getElementById('save-settings-btn');
  saveBtn?.addEventListener('click', () => {
    const rpeSlider = document.getElementById('rpe-slider') as HTMLInputElement;
    const restInput = document.getElementById('rest-input') as HTMLInputElement;

    const rpe = parseInt(rpeSlider?.value || '80');
    const rest = parseInt(restInput?.value || '60');

    // Validate ranges
    const validRPE = Math.max(1, Math.min(100, rpe));
    const validRest = Math.max(10, Math.min(600, rest));

    updateSettings({
      defaultRPE: validRPE,
      defaultRestTime: validRest,
    });

    alert('Settings saved! ✓');
  });

  // Clear All Data button
  const clearBtn = document.getElementById('clear-all-data-btn');
  clearBtn?.addEventListener('click', async () => {
    const confirmed = confirm(
      'Are you sure you want to clear ALL data?\n\nThis will delete:\n• All workouts\n• All custom exercises\n\nThis action cannot be undone!'
    );

    if (confirmed) {
      const doubleCheck = confirm('Are you absolutely sure? This is your last chance to cancel.');

      if (doubleCheck) {
        await clearAllData();
        alert('All data has been cleared.');
        setState({ currentScreen: 'home' });
      }
    }
  });
}
