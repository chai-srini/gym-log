import './style.css';
import { initDB } from './db';
import { getState, subscribe } from './app-state';
import { renderHomeScreen, attachHomeEventListeners } from './screens/home';
import { renderWorkoutScreen, attachWorkoutEventListeners } from './screens/workout';

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
