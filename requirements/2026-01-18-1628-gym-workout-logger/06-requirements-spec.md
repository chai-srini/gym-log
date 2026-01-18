# Requirements Specification: Gym Workout Logger

**Project:** Gym Workout Logger Web App
**Date:** 2026-01-18
**Status:** Requirements Complete
**Additional Documentation:**
- [Testing Strategy with Gherkin & Playwright](07-testing-strategy.md)
- [Sample Feature Files](08-sample-feature-files.md)
- [Technology Stack](TECH-STACK.md)

---

## Executive Summary

A mobile-first Progressive Web App (PWA) for logging weight training workouts with offline-first capabilities, local data storage, and CSV export functionality. Single-user application focused on tracking sets, reps, weight, RPE, and rest times for weight training exercises.

---

## Problem Statement

The user needs a simple, offline-capable mobile web application to log gym workouts (primarily weight training) on their phone. The app must work without internet connectivity in gym environments and allow manual export of workout data to CSV for analysis in spreadsheet applications.

---

## Solution Overview

Build a Progressive Web App that:
- Works completely offline after initial load
- Stores all workout data locally in the browser (IndexedDB)
- Provides a mobile-optimized interface for quick workout logging
- Maintains an exercise library for consistency
- Exports workout history to CSV format
- Allows full management of workout history (view, edit, delete)

---

## Functional Requirements

### FR1: Workout Session Management

**FR1.1: Create New Workout**
- User can start a new workout session
- Session captures start time automatically
- Session includes optional notes field
- Session ends when user completes workout (captures end time/duration)

**FR1.2: Quick Start from Previous Workout**
- User can copy their last workout as a template
- All exercises, sets, and previous values are pre-populated
- User can modify copied values as needed
- Saves time when following consistent workout routines

**FR1.3: View Workout History**
- Display list of all past workout sessions
- Show date, duration, and exercise count for each session
- Sort by date (newest first)
- Provide search/filter capabilities

**FR1.4: Edit Past Workouts**
- User can modify any historical workout session
- Can update exercise details, sets, reps, weights, etc.
- Changes are saved immediately to local storage

**FR1.5: Delete Past Workouts**
- User can delete workout sessions
- Require confirmation before deletion
- Deletion is permanent

### FR2: Exercise Library

**FR2.1: Predefined Exercise List**
- App includes a starter set of common weight training exercises
- Examples: Bench Press, Squat, Deadlift, Overhead Press, Barbell Row, etc.

**FR2.2: Add Custom Exercises**
- User can add new exercises to their library
- Exercise names are free text
- Custom exercises persist across sessions

**FR2.3: Exercise Selection During Workout**
- Quick selection interface (dropdown or searchable list)
- Shows recently used exercises first
- Type-ahead search for finding exercises quickly

### FR3: Set Tracking

**FR3.1: Add Sets to Exercises**
- User can add multiple sets to each exercise
- Each set tracks:
  - **Weight** (numeric, units configurable: lbs/kg)
  - **Reps** (numeric)
  - **RPE** (Rate of Perceived Exertion, numeric 1-100, default: 80)
  - **Rest Time** (numeric seconds, default: 60)

**FR3.2: Quick Entry Interface**
- Optimize for mobile number input
- Pre-fill with values from previous set to speed entry
- Allow quick adjustment (+/- buttons for weight/reps)

**FR3.3: Edit/Delete Sets**
- User can modify set data after entry
- User can delete individual sets
- Changes save immediately

### FR4: Data Persistence

**FR4.1: Local Storage**
- All data stored in browser's IndexedDB
- Data persists across browser sessions
- No cloud storage or backend required

**FR4.2: Data Structure**
```
Workouts Collection:
- id (auto-generated)
- date (ISO timestamp)
- startTime (ISO timestamp)
- endTime (ISO timestamp)
- duration (calculated, minutes)
- notes (string, optional)
- exercises (array)
  - exerciseName (string)
  - notes (string, optional)
  - sets (array)
    - setNumber (integer)
    - weight (number)
    - reps (integer)
    - rpe (integer, default 80)
    - restTime (integer seconds, default 60)

Exercises Library Collection:
- id (auto-generated)
- name (string, unique)
- lastUsed (ISO timestamp)
- useCount (integer)
```

### FR5: CSV Export

**FR5.1: Export All Data**
- User can export all workout history to CSV file
- Download triggered from app menu/settings
- File named with timestamp: `gym-log-YYYY-MM-DD.csv`

**FR5.2: CSV Format**
- One row per set
- Columns: Date, Exercise, Set, Weight, Reps, RPE, Rest (seconds), Workout Notes
- Include headers in first row
- Use standard CSV escaping for text fields

**FR5.3: CSV Import (Future)**
- Not required for MVP
- Placeholder for future enhancement

### FR6: Progressive Web App Features

**FR6.1: Installability**
- App can be installed to mobile home screen
- Includes app icon and splash screen
- Appears as standalone app (no browser UI)

**FR6.2: Offline Functionality**
- Service Worker caches all app assets
- App works without internet connection after first load
- Data operations work offline (all local)

**FR6.3: Mobile Optimization**
- Responsive design for phone screens (primary)
- Touch-friendly UI (44x44px minimum tap targets)
- Mobile keyboard optimization for number entry
- Landscape and portrait support

---

## Technical Requirements

### TR1: Technology Stack

**TR1.1: Frontend**
- **Language:** TypeScript
- **Framework:** React (or Vanilla TypeScript)
- **Reasoning:** TypeScript provides type safety for data models, catches bugs at compile time, and improves IDE experience
- HTML5, modern ES6+ features

**TR1.2: Storage**
- IndexedDB for workout data storage
- Consider wrapper library like `idb` or `Dexie.js` for easier API

**TR1.3: Build Tool**
- **Recommendation:** Vite
- Fast development server
- Excellent PWA plugin support (`vite-plugin-pwa`)
- Zero-config for simple projects

**TR1.4: UI Framework**
- **CSS Framework:** Tailwind CSS
- **Reasoning:** Mobile-first utilities, rapid prototyping, consistent spacing for touch targets, automatic purging for small bundle size
- Mobile-first approach
- Fast, responsive, minimal runtime overhead

### TR2: Browser Compatibility

**TR2.1: Target Browsers**
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)
- These cover >95% of mobile users

**TR2.2: Required APIs**
- Service Worker API (for offline support)
- IndexedDB (for data storage)
- Web App Manifest (for installability)
- Blob API (for CSV generation)

### TR3: Performance

**TR3.1: Load Time**
- Initial load < 3 seconds on 3G connection
- Subsequent loads instant (cached by service worker)

**TR3.2: Runtime Performance**
- Smooth 60fps scrolling and interactions
- Instant UI feedback (<100ms) for user actions

### TR4: Data Management

**TR4.1: Storage Capacity**
- IndexedDB has no practical limit for this use case
- Expect <1MB per year of regular use
- No cleanup/archival needed for typical user

**TR4.2: Data Export**
- CSV generation happens client-side (no server)
- Use Blob API to create file
- Trigger download via temporary anchor element

---

## User Interface Requirements

### UI1: Main Navigation

**UI1.1: Home Screen**
- "Start New Workout" button (prominent)
- "Quick Start" button (copy last workout)
- List of recent workouts (last 10)
- "View All Workouts" link
- "Export Data" button
- Settings/Help icon

### UI2: Active Workout Screen

**UI2.1: Workout Header**
- Display current workout date/time
- Show elapsed time (timer)
- "End Workout" button
- "Cancel Workout" option

**UI2.2: Exercise Entry**
- "Add Exercise" button
- Exercise selection dropdown/search
- List of added exercises (expandable/collapsible)

**UI2.3: Set Entry**
- Current exercise displayed prominently
- Quick entry fields: Weight, Reps, RPE, Rest Time
- "Add Set" button
- Previous set values shown for reference
- List of completed sets for current exercise

**UI2.4: Mobile UX**
- Large, thumb-friendly buttons
- Number inputs optimized (show numeric keypad)
- Swipe gestures (optional: swipe to delete set)
- Minimal navigation steps

### UI3: History Screen

**UI3.1: Workout List**
- Chronological list of workouts
- Display: Date, duration, exercise count
- Tap to view details
- Swipe to delete (with confirmation)

**UI3.2: Workout Detail View**
- Show all exercises and sets
- Edit button (enter edit mode)
- Delete button (with confirmation)
- Export individual workout option (optional)

### UI4: Settings/Preferences

**UI4.1: Weight Units**
- Toggle between lbs/kg
- Default: lbs
- Applies globally to all workouts

**UI4.2: Data Management**
- Export all data to CSV
- Clear all data (with strong confirmation)
- About/version info

---

## Implementation Hints

### IH1: Project Structure
```
/
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── sw.ts                   # Service worker (TypeScript)
├── src/
│   ├── main.ts            # Main application entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── db.ts              # IndexedDB wrapper
│   ├── export.ts          # CSV export functionality
│   ├── ui.ts              # UI rendering and interactions
│   └── utils.ts           # Helper functions
├── styles/
│   └── main.css           # Tailwind directives and custom styles
├── assets/
│   ├── icon-192.png       # PWA icon
│   ├── icon-512.png       # PWA icon
│   └── favicon.ico
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration (for Tailwind)
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies and scripts
```

### IH2: TypeScript Type Definitions
```typescript
// src/types.ts
export interface Set {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;      // 1-100, default 80
  restTime: number; // seconds, default 60
}

export interface Exercise {
  exerciseName: string;
  notes: string;
  sets: Set[];
}

export interface Workout {
  id?: number;              // Auto-generated by IndexedDB
  date: string;             // ISO date string
  startTime: string;        // ISO timestamp
  endTime: string;          // ISO timestamp
  duration: number;         // Minutes
  notes: string;
  exercises: Exercise[];
}

export interface ExerciseLibraryItem {
  id?: number;              // Auto-generated by IndexedDB
  name: string;
  lastUsed: string;         // ISO timestamp
  useCount: number;
}

export type WeightUnit = 'lbs' | 'kg';

export interface AppSettings {
  weightUnit: WeightUnit;
  defaultRPE: number;
  defaultRestTime: number;
}
```

### IH3: IndexedDB Schema
```typescript
// Database: gym-log
// Version: 1
// Object Stores:
// - workouts (keyPath: 'id', autoIncrement: true)
//   - indexes: date, startTime
// - exercises (keyPath: 'id', autoIncrement: true)
//   - indexes: name (unique), lastUsed
```

### IH4: Service Worker Strategy
- Cache-first strategy for static assets (HTML, CSS, JS, icons)
- Network-first strategy not needed (no API calls)
- Pre-cache all assets during service worker installation
- Update service worker when new version deployed

### IH5: Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
```

```css
/* styles/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities for mobile optimization */
@layer utilities {
  .tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
  }
}
```

### IH6: Starter Exercise List
Include these common exercises:
- Barbell: Bench Press, Squat, Deadlift, Overhead Press, Barbell Row, Romanian Deadlift
- Dumbbell: Dumbbell Press, Dumbbell Row, Dumbbell Curl, Dumbbell Fly
- Bodyweight: Pull-ups, Chin-ups, Dips, Push-ups
- Machines: Lat Pulldown, Cable Row, Leg Press, Leg Curl, Leg Extension

---

## Acceptance Criteria

### AC1: Core Workflow
- [ ] User can create a new workout, add exercises, log sets, and complete workout
- [ ] All workout data persists after closing and reopening app
- [ ] User can view history of all past workouts
- [ ] User can edit any past workout
- [ ] User can delete past workouts

### AC2: Exercise Library
- [ ] App includes 15+ common exercises pre-loaded
- [ ] User can add custom exercises
- [ ] Exercise selection is fast and searchable
- [ ] Recently used exercises appear first

### AC3: Set Tracking
- [ ] Each set captures: weight, reps, RPE (default 80), rest time (default 60s)
- [ ] Values pre-fill from previous set for quick entry
- [ ] All data types validate correctly (numbers only where appropriate)

### AC4: PWA Features
- [ ] App is installable to home screen (iOS and Android)
- [ ] App works completely offline after first load
- [ ] App icon and name display correctly when installed
- [ ] No browser UI visible in standalone mode

### AC5: CSV Export
- [ ] Export button generates CSV file
- [ ] CSV includes all workout data in correct format
- [ ] File downloads automatically with timestamp in filename
- [ ] CSV can be imported into Google Sheets without errors

### AC6: Mobile UX
- [ ] All interactive elements are easily tappable on phone
- [ ] Number keyboards appear for numeric fields
- [ ] App is responsive and usable in portrait and landscape
- [ ] No horizontal scrolling required
- [ ] Performance is smooth (60fps interactions)

### AC7: Data Integrity
- [ ] No data loss on browser refresh
- [ ] No data loss when offline
- [ ] Edit operations save correctly
- [ ] Delete operations are permanent and confirmed

---

## Assumptions

1. **Single User:** No authentication, user accounts, or multi-device sync needed
2. **Weight Training Focus:** Initial version focuses only on weight training; cardio/running/bouldering are future enhancements
3. **Manual Export:** User is comfortable with manual CSV export and import into Google Sheets (no automatic sync)
4. **Modern Browsers:** User has access to iOS Safari or Android Chrome (no IE11 or old browser support)
5. **Local Storage Only:** All data stays on device; no cloud backup or cross-device sync
6. **English Only:** No internationalization needed for MVP
7. **Imperial Units Default:** Default to pounds (lbs) for weight, though kg option available
8. **No Social Features:** No sharing, no social feed, no competitive elements
9. **No Workout Plans:** App logs completed workouts but doesn't prescribe workout plans
10. **No Timers:** Rest time is logged but app doesn't provide countdown timers (nice-to-have for future)

---

## Out of Scope (Future Enhancements)

These features are NOT included in the MVP but may be considered later:

1. **Other Workout Types:** Indoor cardio, outdoor running, indoor bouldering tracking
2. **Progress Visualizations:** Charts and graphs showing progress over time
3. **Rest Timers:** Countdown timer between sets
4. **Workout Plans:** Pre-defined workout routines or programs
5. **Cloud Sync:** Multi-device synchronization
6. **Social Features:** Sharing workouts, following friends
7. **Exercise Instructions:** Videos or descriptions of how to perform exercises
8. **Body Measurements:** Weight, body fat %, measurements tracking
9. **Nutrition Logging:** Meal tracking, calorie counting
10. **Auto Google Sheets Sync:** Direct API integration with Google Sheets
11. **Advanced Analytics:** Volume calculations, one-rep max estimates, fatigue tracking
12. **Templates:** Save and reuse custom workout templates
13. **Notes/Photos:** Attach photos or extensive notes to workouts
14. **Calendar View:** View workouts in calendar format

---

## Success Metrics

How to measure if this project is successful:

1. **Functional Completeness:** All acceptance criteria met
2. **Usability:** User can log a complete workout in under 5 minutes
3. **Reliability:** No data loss, works offline consistently
4. **Performance:** Loads and runs smoothly on target mobile devices
5. **User Satisfaction:** User prefers this app to paper notebook or existing apps

---

## Next Steps

1. **Set up development environment:**
   - Initialize Vite project with TypeScript template
   - Install and configure Tailwind CSS with PostCSS
   - Install PWA plugin (`vite-plugin-pwa`)
   - Install IndexedDB wrapper (`idb` or `Dexie.js`)
   - Set up TypeScript types in `src/types.ts`

2. **Implement data layer:**
   - Create IndexedDB wrapper with TypeScript interfaces
   - Implement workout and exercise CRUD operations
   - Add data persistence and retrieval functions

3. **Build core UI:**
   - Create workout logging interface with Tailwind CSS
   - Implement exercise selection and set entry forms
   - Add workout history view

4. **Implement PWA features:**
   - Configure service worker and manifest
   - Add app icons and splash screens
   - Test offline functionality

5. **Add export functionality:**
   - Implement CSV generation with proper TypeScript types
   - Add download functionality

6. **Test on mobile devices:**
   - Ensure compatibility with iOS Safari and Android Chrome
   - Verify touch targets meet 44x44px minimum
   - Test offline and installability

7. **Deploy:**
   - Build production bundle
   - Host on static hosting service (GitHub Pages, Netlify, Vercel)

---

## Technical Risks and Mitigations

### Risk 1: IndexedDB Browser Compatibility
**Risk:** IndexedDB implementation varies between browsers
**Mitigation:** Use well-tested library like `idb` or `Dexie.js` for abstraction
**Fallback:** LocalStorage for critical data (though limited capacity)

### Risk 2: iOS Safari PWA Limitations
**Risk:** iOS Safari has some PWA limitations vs Android
**Mitigation:** Test extensively on actual iOS devices during development
**Impact:** Some features may work differently but core functionality should be fine

### Risk 3: Storage Quota
**Risk:** Browser may limit storage or clear data under pressure
**Mitigation:** IndexedDB is persistent storage, but remind users to export regularly
**Backup:** CSV export provides user-controlled backup

### Risk 4: Offline State Management
**Risk:** Complex state management when fully offline
**Mitigation:** Keep it simple - all operations are local only, no sync needed
**Benefit:** Simplicity reduces this risk significantly

---

## Questions Still Open

None - all requirements clarified during discovery phase.

---

## Appendix: Data Model Example

### TypeScript Usage
```typescript
import { Workout } from './types';

// Example workout with full type safety
const exampleWorkout: Workout = {
  id: 1,
  date: "2026-01-18",
  startTime: "2026-01-18T10:30:00Z",
  endTime: "2026-01-18T11:45:00Z",
  duration: 75,
  notes: "Felt strong today",
  exercises: [
    {
      exerciseName: "Bench Press",
      notes: "",
      sets: [
        { setNumber: 1, weight: 185, reps: 8, rpe: 75, restTime: 120 },
        { setNumber: 2, weight: 185, reps: 7, rpe: 80, restTime: 120 },
        { setNumber: 3, weight: 185, reps: 6, rpe: 85, restTime: 120 }
      ]
    },
    {
      exerciseName: "Barbell Row",
      notes: "Focus on form",
      sets: [
        { setNumber: 1, weight: 135, reps: 10, rpe: 70, restTime: 90 },
        { setNumber: 2, weight: 135, reps: 10, rpe: 75, restTime: 90 },
        { setNumber: 3, weight: 135, reps: 9, rpe: 80, restTime: 90 }
      ]
    }
  ]
};
```

### JSON Storage Format
```json
{
  "id": 1,
  "date": "2026-01-18",
  "startTime": "2026-01-18T10:30:00Z",
  "endTime": "2026-01-18T11:45:00Z",
  "duration": 75,
  "notes": "Felt strong today",
  "exercises": [
    {
      "exerciseName": "Bench Press",
      "notes": "",
      "sets": [
        {
          "setNumber": 1,
          "weight": 185,
          "reps": 8,
          "rpe": 75,
          "restTime": 120
        },
        {
          "setNumber": 2,
          "weight": 185,
          "reps": 7,
          "rpe": 80,
          "restTime": 120
        },
        {
          "setNumber": 3,
          "weight": 185,
          "reps": 6,
          "rpe": 85,
          "restTime": 120
        }
      ]
    },
    {
      "exerciseName": "Barbell Row",
      "notes": "Focus on form",
      "sets": [
        {
          "setNumber": 1,
          "weight": 135,
          "reps": 10,
          "rpe": 70,
          "restTime": 90
        },
        {
          "setNumber": 2,
          "weight": 135,
          "reps": 10,
          "rpe": 75,
          "restTime": 90
        },
        {
          "setNumber": 3,
          "weight": 135,
          "reps": 9,
          "rpe": 80,
          "restTime": 90
        }
      ]
    }
  ]
}
```

---

**End of Requirements Specification**
