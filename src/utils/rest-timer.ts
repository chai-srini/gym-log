/**
 * Rest Timer Utility
 * Manages rest timer state between sets
 */

export interface RestTimerState {
  isActive: boolean;
  presetSeconds: number;
  elapsedSeconds: number;
  hasNotified: boolean;
  startTime: number | null;
  intervalId: number | null;
}

let timerState: RestTimerState = {
  isActive: false,
  presetSeconds: 0,
  elapsedSeconds: 0,
  hasNotified: false,
  startTime: null,
  intervalId: null,
};

type TimerCallback = (state: RestTimerState) => void;
let timerCallbacks: TimerCallback[] = [];

/**
 * Subscribe to timer updates
 */
export function subscribeToTimer(callback: TimerCallback): () => void {
  timerCallbacks.push(callback);
  return () => {
    timerCallbacks = timerCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Notify all subscribers of timer state change
 */
function notifyTimerUpdate(): void {
  timerCallbacks.forEach(callback => callback(timerState));
}

/**
 * Start a rest timer
 */
export function startRestTimer(seconds: number): void {
  // Clear any existing timer
  stopRestTimer();

  // Request notification permission
  requestNotificationPermission();

  timerState = {
    isActive: true,
    presetSeconds: seconds,
    elapsedSeconds: 0,
    hasNotified: false,
    startTime: Date.now(),
    intervalId: window.setInterval(() => {
      timerState.elapsedSeconds += 1;

      // Notify at preset time (once), but keep counting
      if (timerState.elapsedSeconds === timerState.presetSeconds && !timerState.hasNotified) {
        notifyAtPreset();
        timerState.hasNotified = true;
      }

      notifyTimerUpdate();
    }, 1000),
  };

  notifyTimerUpdate();
}

/**
 * Stop and clear the timer
 */
export function stopRestTimer(): void {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
  }

  timerState = {
    isActive: false,
    presetSeconds: 0,
    elapsedSeconds: 0,
    hasNotified: false,
    startTime: null,
    intervalId: null,
  };

  notifyTimerUpdate();
}

/**
 * Add time to the current timer (no longer used in count-up timer)
 * Kept for backward compatibility but does nothing
 */
export function addTimerTime(seconds: number): void {
  // No-op in count-up timer
  return;
}

/**
 * Get current timer state
 */
export function getTimerState(): RestTimerState {
  return { ...timerState };
}

/**
 * Notify user at preset time (but timer continues)
 */
function notifyAtPreset(): void {
  // Vibration notification (if supported)
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }

  // Audio notification
  playNotificationSound();

  // Show notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Rest Time Reached! 💪', {
      body: 'Suggested rest complete - take more time if needed',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'rest-timer',
      requireInteraction: false,
    });
  }
}

/**
 * Play a simple notification sound using Web Audio API
 */
function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

/**
 * Request notification permission
 */
export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
