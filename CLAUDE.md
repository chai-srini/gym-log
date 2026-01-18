# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gym Workout Logger - A mobile-first Progressive Web App for logging gym workouts with offline support. Built with Vanilla TypeScript (no framework), Tailwind CSS v4, and IndexedDB for local persistence.

## Referencing Past Work

The `conversations/` folder contains detailed documentation of previous development sessions (gitignored):

- **[gym-logger-initial-build-2026-01-18.md](conversations/gym-logger-initial-build-2026-01-18.md)** - Initial project setup, database implementation, core features
- **[gym-log-exercise-categories-github-deployment-2026-01-18.md](conversations/gym-log-exercise-categories-github-deployment-2026-01-18.md)** - Exercise categories, filtering, GitHub Pages deployment

**When to read these files:**
- Understanding implementation decisions and architectural choices
- Learning about errors encountered and how they were resolved
- Discovering feature implementation patterns already established
- Understanding user preferences and feedback from previous sessions

**Example prompts for future sessions:**
- "Read conversations/gym-logger-initial-build-2026-01-18.md to understand the database schema design"
- "Check conversations/ for how exercise categories were implemented"
- "Review past conversation exports to see deployment configuration decisions"

These exports provide crucial context about the "why" behind code decisions, not just the "what" you can see in the code itself.

## Development Commands

```bash
# Development
npm run dev                  # Start dev server on http://localhost:5173 (exposed to network)

# Building
npm run build                # TypeScript compile + Vite build
GITHUB_PAGES=true npm run build  # Build for GitHub Pages deployment

# Preview
npm run preview              # Preview production build locally

# Testing (when implemented)
npm run test:e2e             # Run Playwright E2E tests
npm run test:e2e:headed      # Run with browser UI visible
npm run test:mobile          # Run mobile viewport tests
npm run test:ui              # Launch Playwright UI mode
```

## Architecture

### Screen-Based Architecture

The app uses a **screen-based routing system** without any framework. Each screen is a module in `src/screens/` with two key functions:

```typescript
// Pattern for all screens
export async function renderScreenName(): Promise<string> {
  // 1. Fetch data from database (async)
  // 2. Get current state
  // 3. Return HTML string
}

export function attachScreenNameEventListeners(): void {
  // 1. Query DOM elements
  // 2. Attach event handlers
  // 3. Subscribe to external state (if needed)
}
```

**Flow:**
1. State change triggers `render()` in `main.ts`
2. Router calls appropriate `renderXScreen()` based on `currentScreen`
3. HTML string set via `app.innerHTML`
4. Corresponding `attachXEventListeners()` called to wire up interactions

**IMPORTANT:** Always attach event listeners AFTER setting innerHTML, never before.

### State Management

Simple observer pattern in `src/app-state.ts`:

```typescript
interface AppState {
  currentScreen: Screen;           // 'home' | 'workout' | 'history' | 'settings' | 'exercise-library' | 'edit-workout'
  currentWorkout: Partial<Workout> | null;  // Active workout being logged
  settings: AppSettings;            // Persisted to localStorage
}
```

**Key functions:**
- `getState()` - Read current state
- `setState(updates)` - Update state (triggers re-render of all screens)
- `subscribe(callback)` - Subscribe to state changes

**Pattern:** State updates trigger full page re-renders. This is acceptable for this app's complexity.

### Database Layer (IndexedDB)

Database wrapper in `src/db.ts` using `idb` library. Two object stores:

**Workouts Store:**
- Auto-incrementing ID
- Indexed by: date, startTime
- Full CRUD operations available

**Exercises Store:**
- Auto-incrementing ID
- Indexed by: name (unique), lastUsed
- Tracks usage count for sorting/prioritization
- Categories: Push, Pull, Legs, Arms, Core, Other

**Database Version:** Currently v2 (exercise categories added)

**CRITICAL:** When adding new fields, increment `DB_VERSION` and add migration logic in the `upgrade()` callback:

```typescript
if (oldVersion < 3) {
  const store = transaction.objectStore('storeName');
  store.getAll().then((items) => {
    items.forEach((item) => {
      item.newField = defaultValue;
      store.put(item);
    });
  });
}
```

### Timer Management Pattern

**Workout Timer** (`src/screens/workout.ts`):
- Module-level `timerInterval` variable
- Started in `startTimer()`, stopped in `stopTimer()`
- Updates DOM every second via `setInterval`
- MUST be cleaned up when leaving screen

**Rest Timer** (`src/utils/rest-timer.ts`):
- Separate utility with its own state
- Observable pattern: `subscribeToTimer(callback)`
- Module-level `timerUnsubscribe` in workout screen
- MUST unsubscribe when leaving screen to prevent memory leaks

**CRITICAL Pattern:**
```typescript
let timerUnsubscribe: (() => void) | null = null;

export function attachWorkoutEventListeners(): void {
  // Unsubscribe from previous timer if exists
  if (timerUnsubscribe) {
    timerUnsubscribe();
  }

  // Subscribe to timer updates
  timerUnsubscribe = subscribeToTimer(() => {
    setState({ ...getState() }); // Trigger re-render
  });
}
```

This pattern prevents duplicate subscriptions across re-renders.

### Input Handling to Prevent Focus Loss

Use `blur` events instead of `input` events for text inputs to avoid re-renders while typing:

```typescript
// CORRECT - blur event
workoutNameInput?.addEventListener('blur', (e) => {
  updateWorkoutName((e.target as HTMLInputElement).value);
});

// INCORRECT - input event causes focus loss
workoutNameInput?.addEventListener('input', (e) => {
  updateWorkoutName((e.target as HTMLInputElement).value);
});
```

### Settings Persistence

Settings are stored in `localStorage` (not IndexedDB) for immediate synchronous access:
- Key: `'gym-log-settings'`
- Loaded on app initialization
- Updated via `updateSettings()` which saves to localStorage automatically

## Tailwind CSS v4 Specifics

This project uses **Tailwind CSS v4**, which has different syntax than v3:

**CSS Import:**
```css
/* Correct v4 syntax */
@import "tailwindcss";

/* Incorrect v3 syntax - DO NOT USE */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Custom Utilities:**
```css
/* v4 uses @utility */
@utility min-h-touch {
  min-height: 44px;
}
```

**PostCSS Plugin:**
- Must use `@tailwindcss/postcss` (not `tailwindcss` plugin)
- Configured in `postcss.config.js`

## PWA & Offline Support

**Service Worker:** `public/sw.js`
- Cache-first strategy for app shell
- Manual cache updates every hour
- Register in `main.ts` after DOM load

**Manifest:** `public/manifest.json`
- App name, theme colors, icons
- Display mode: standalone

**Icons:** 8 sizes from 72x72 to 512x512 in `public/icons/`

## GitHub Pages Deployment

**Automatic deployment** via GitHub Actions (`.github/workflows/deploy.yml`):
- Triggers on push to `main` branch
- Sets `GITHUB_PAGES=true` environment variable
- Base path: `/gym-log/` (configured in `vite.config.ts`)

**Local vs Production:**
- Local dev: `base: '/'`
- GitHub Pages: `base: '/gym-log/'`
- Controlled by `process.env.GITHUB_PAGES`

**npm Registry:**
- Project uses public npm registry (`registry=https://registry.npmjs.org/`)
- Configured in `.npmrc` to prevent internal registry auth issues
- Never commit `.npmrc` with authentication tokens

## Important Patterns

### Smart Defaults for Data Entry

When displaying input forms, pre-fill from the last set of the same exercise:

```typescript
const lastSet = exercise.sets[exercise.sets.length - 1];
const defaultWeight = lastSet ? lastSet.weight : '';
const defaultRPE = lastSet ? lastSet.rpe : settings.defaultRPE;
const defaultRestTime = lastSet ? lastSet.restTime : settings.defaultRestTime;
```

This speeds up data entry since users typically do similar sets within an exercise.

### Exercise Library Usage Tracking

When completing a workout, increment usage for all exercises:

```typescript
for (const exercise of currentWorkout.exercises) {
  await incrementExerciseUsage(exercise.exerciseName);
}
```

This powers "most used" sorting and Quick Start functionality.

### Confirmation Dialogs for Destructive Actions

Always show meaningful confirmation with specific details:

```typescript
// GOOD - shows what will be deleted
if (confirm(`Delete ${exerciseName}? All sets will be lost.`)) {
  deleteExerciseFromWorkout(exerciseIndex);
}

// BAD - generic message
if (confirm('Are you sure?')) { ... }
```

### Category System

6 exercise categories with color coding:
- **Push** (Red): Pressing movements
- **Pull** (Blue): Pulling movements
- **Legs** (Green): Lower body
- **Arms** (Purple): Arm isolation
- **Core** (Yellow): Core/abs
- **Other** (Gray): Everything else

When adding new exercises, always require category selection (defaults to 'Other').

## Testing the App

### Mobile Testing on Local Network

Vite is configured with `host: true` to expose the dev server:
- Computer: http://localhost:5173
- Phone (same WiFi): http://192.168.1.x:5173

### Database Testing

Manual test suite available at `test-db.html`:
- Open in browser
- Runs 11 tests validating all DB operations
- Useful for debugging IndexedDB issues

## Common Gotchas

1. **Re-renders reset focus** - Use `blur` events for text inputs, not `input` events

2. **Timer cleanup** - Always unsubscribe from timers when leaving workout screen

3. **IndexedDB async** - All database operations are async, use `await`

4. **Unique exercise names** - Exercise names have unique constraint, handle `ConstraintError`

5. **Settings reload** - Settings changes require page reload to see effect (stored in localStorage)

6. **Base path in production** - Service worker and manifest paths must respect base path for GitHub Pages

7. **Category migration** - Existing databases from v1 will auto-migrate to v2 with 'Other' category

8. **Weight unit display** - Always read `settings.weightUnit` dynamically, never hardcode 'lbs' or 'kg'

## Screen Responsibilities

- **home**: Recent workouts, Quick Start button, navigation
- **workout**: Active workout logging with live timer, exercise/set entry
- **history**: View all past workouts, expandable cards, CRUD operations
- **exercise-library**: Browse exercises, category filtering, add/delete custom exercises
- **settings**: Weight unit, default RPE/rest time, clear all data
- **edit-workout**: Modify past workouts (name, notes, exercises, sets)

## Key Files

- `src/main.ts` - App entry point, screen router, service worker registration
- `src/app-state.ts` - State management, workout helpers, settings persistence
- `src/db.ts` - IndexedDB wrapper, migrations, CRUD operations
- `src/types.ts` - TypeScript interfaces, constants, starter exercises
- `src/utils/rest-timer.ts` - Rest timer utility with notifications
- `public/sw.js` - Service worker for offline support
- `public/manifest.json` - PWA manifest

## Data Flow Example

**Completing a workout:**
1. User clicks "Complete Workout" button
2. Event handler reads workout name from input (blur ensures it's updated)
3. Calculate duration: `endTime - startTime`
4. Call `addWorkout()` to save to IndexedDB
5. For each exercise, call `incrementExerciseUsage()`
6. Show success alert with summary
7. Call `setState({ currentScreen: 'home', currentWorkout: null })`
8. State change triggers re-render → home screen displays
9. Timer cleanup happens in complete handler

**Adding a set during workout:**
1. User enters weight/reps/RPE/rest, clicks "Add Set"
2. Read all inputs via `data-exercise` attributes
3. Validate required fields (weight, reps)
4. Create `Set` object with setNumber (count + 1)
5. Call `addSetToExercise(exerciseIndex, newSet)`
6. Trigger `setState()` → re-render
7. Start rest timer with `startRestTimer(newSet.restTime)`
8. Timer subscription triggers re-renders to show modal
9. Form pre-fills from new last set for next entry
