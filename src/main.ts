import './style.css';
import { initDB } from './db';
import { getState, subscribe } from './app-state';
import { renderHomeScreen, attachHomeEventListeners } from './screens/home';
import { renderWorkoutScreen, attachWorkoutEventListeners } from './screens/workout';
import { renderHistoryScreen, attachHistoryEventListeners } from './screens/history';
import { renderSettingsScreen, attachSettingsEventListeners } from './screens/settings';
import { renderExerciseLibraryScreen, attachExerciseLibraryEventListeners } from './screens/exercise-library';
import { renderEditWorkoutScreen, attachEditWorkoutEventListeners } from './screens/edit-workout';
import { renderTemplatesScreen, attachTemplatesEventListeners } from './screens/templates';

// Initialize database
await initDB();

// App root element
const app = document.querySelector<HTMLDivElement>('#app')!;

// Render current screen
async function render() {
  const { currentScreen } = getState();

  let html = '';
  let attachListeners: (() => void) | null = null;

  switch (currentScreen) {
    case 'home':
      html = await renderHomeScreen();
      attachListeners = attachHomeEventListeners;
      break;
    case 'workout':
      html = await renderWorkoutScreen();
      attachListeners = attachWorkoutEventListeners;
      break;
    case 'history':
      html = await renderHistoryScreen();
      attachListeners = attachHistoryEventListeners;
      break;
    case 'settings':
      html = await renderSettingsScreen();
      attachListeners = attachSettingsEventListeners;
      break;
    case 'exercise-library':
      html = await renderExerciseLibraryScreen();
      attachListeners = attachExerciseLibraryEventListeners;
      break;
    case 'edit-workout':
      html = await renderEditWorkoutScreen();
      attachListeners = attachEditWorkoutEventListeners;
      break;
    case 'templates':
      html = await renderTemplatesScreen();
      attachListeners = attachTemplatesEventListeners;
      break;
    default:
      html = '<div>Unknown screen</div>';
  }

  app.innerHTML = html;

  // Attach event listeners after DOM update
  if (attachListeners) {
    attachListeners();
  }
}

// Subscribe to state changes
subscribe(() => {
  render();
});

// Initial render
render();

console.log('🚀 Gym Logger initialized');

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
