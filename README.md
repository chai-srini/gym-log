# Gym Workout Logger

A mobile-first Progressive Web App for logging gym workouts with offline support.

## Features (Planned)

- 📱 Mobile-first responsive design
- 💪 Track weight training exercises (sets, reps, weight, RPE, rest time)
- 📚 Exercise library with pre-loaded common exercises
- ⚡ Quick start from previous workouts
- 📊 Workout history with full CRUD operations
- 📤 CSV export for data analysis
- 🔌 Works completely offline
- 📲 Installable as PWA

## Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **IndexedDB** (via idb) - Local data persistence
- **Playwright + Cucumber** - E2E testing (to be added)

## Getting Started

### Prerequisites

- Node.js 22.15.0 or later
- npm 10.9.2 or later

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
gym-log/
├── src/
│   ├── main.ts              # App entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── db.ts                # IndexedDB wrapper
│   ├── style.css            # Tailwind CSS + custom styles
│   └── (more to come...)
├── requirements/            # Full requirements documentation
├── index.html               # HTML entry point
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Requirements Documentation

Complete requirements, specifications, and learning materials are in the [requirements/](requirements/2026-01-18-1628-gym-workout-logger/) folder:

- **[README.md](requirements/2026-01-18-1628-gym-workout-logger/README.md)** - Complete project overview
- **[06-requirements-spec.md](requirements/2026-01-18-1628-gym-workout-logger/06-requirements-spec.md)** - Full specification
- **[LEARNING-PATH.md](requirements/2026-01-18-1628-gym-workout-logger/LEARNING-PATH.md)** - 5-week learning guide for Gherkin & Playwright
- **[07-testing-strategy.md](requirements/2026-01-18-1628-gym-workout-logger/07-testing-strategy.md)** - Testing approach
- **[08-sample-feature-files.md](requirements/2026-01-18-1628-gym-workout-logger/08-sample-feature-files.md)** - Complete Gherkin scenarios

## Current Status

✅ **Phase 1 Complete**: Project Setup

- [x] Vite + TypeScript initialized
- [x] Tailwind CSS configured
- [x] IndexedDB wrapper created
- [x] Type definitions defined
- [x] Basic UI structure created
- [x] Dev server running

🚧 **Next Steps**: Implement Core Features

- [ ] Workout creation flow
- [ ] Exercise selection
- [ ] Set entry with defaults
- [ ] Data persistence
- [ ] Workout history view

## Learning Goals

This project is designed to learn:
- TypeScript & Vite
- Tailwind CSS for mobile-first design
- IndexedDB for offline storage
- PWA development
- **Gherkin & Playwright** for BDD/E2E testing (see [LEARNING-PATH.md](requirements/2026-01-18-1628-gym-workout-logger/LEARNING-PATH.md))

## License

MIT

## Author

Built as a learning project following comprehensive requirements and BDD practices.
