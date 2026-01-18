/**
 * Rest Timer Utility
 * Manages rest timer state between sets
 */

export interface RestTimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  startTime: number | null;
  intervalId: number | null;
}

let timerState: RestTimerState = {
  isActive: false,
  totalSeconds: 0,
  remainingSeconds: 0,
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

  timerState = {
    isActive: true,
    totalSeconds: seconds,
    remainingSeconds: seconds,
    startTime: Date.now(),
    intervalId: window.setInterval(() => {
      timerState.remainingSeconds -= 1;

      if (timerState.remainingSeconds <= 0) {
        completeTimer();
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
    totalSeconds: 0,
    remainingSeconds: 0,
    startTime: null,
    intervalId: null,
  };

  notifyTimerUpdate();
}

/**
 * Add time to the current timer
 */
export function addTimerTime(seconds: number): void {
  if (!timerState.isActive) return;

  timerState.remainingSeconds += seconds;
  timerState.totalSeconds += seconds;
  notifyTimerUpdate();
}

/**
 * Get current timer state
 */
export function getTimerState(): RestTimerState {
  return { ...timerState };
}

/**
 * Timer completion - notify user
 */
function completeTimer(): void {
  stopRestTimer();

  // Vibration notification (if supported)
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }

  // Audio notification
  playNotificationSound();

  // Show notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Rest Complete! 💪', {
      body: 'Time for your next set',
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
