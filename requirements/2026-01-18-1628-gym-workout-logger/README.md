# Gym Workout Logger - Requirements Package

**Project Start:** 2026-01-18
**Status:** Requirements Complete, Ready for Implementation

---

## Quick Start Guide

This folder contains all requirements and specifications for building a mobile-first gym workout logging Progressive Web App.

### What's Inside

1. **[00-initial-request.md](00-initial-request.md)**
   Your original request and key points

2. **[06-requirements-spec.md](06-requirements-spec.md)** ⭐ **Start Here**
   Complete requirements specification including:
   - Functional requirements
   - Technical requirements
   - UI/UX requirements
   - Acceptance criteria
   - Implementation hints
   - TypeScript types
   - Data models

3. **[07-testing-strategy.md](07-testing-strategy.md)** 🧪
   Complete guide to learning BDD with Gherkin and E2E testing with Playwright:
   - Learning path (beginner to advanced)
   - Setup instructions
   - Example test code
   - Best practices

4. **[08-sample-feature-files.md](08-sample-feature-files.md)** 📝
   Complete Gherkin feature files covering all functionality:
   - Workout management
   - Exercise library
   - Set tracking
   - CSV export
   - PWA features
   - Settings

5. **[TECH-STACK.md](TECH-STACK.md)** 🔧
   Technology choices and dependencies:
   - TypeScript + Vite
   - Tailwind CSS
   - IndexedDB
   - Playwright + Cucumber

---

## Project Overview

### What You're Building

A mobile web app for logging gym workouts with:
- **Offline-first PWA** - Works without internet
- **Weight training focus** - Track exercises, sets, reps, weight, RPE, rest time
- **Exercise library** - Pre-loaded + custom exercises
- **Quick start** - Copy previous workouts
- **CSV export** - Manual export for spreadsheet analysis
- **Local storage only** - No backend, no cloud sync

### Technology Stack

- **Language:** TypeScript
- **Build Tool:** Vite
- **CSS:** Tailwind CSS
- **Storage:** IndexedDB
- **PWA:** vite-plugin-pwa
- **Testing:** Playwright + Cucumber/Gherkin (learning objective)

### Key Features

1. ✅ Create and track workout sessions
2. ✅ Manage exercise library (pre-loaded + custom)
3. ✅ Log sets with weight, reps, RPE, rest time
4. ✅ Quick start from previous workout
5. ✅ View and edit workout history
6. ✅ Export data to CSV
7. ✅ Works completely offline
8. ✅ Installable to mobile home screen

---

## Implementation Path

### Phase 1: Setup (Week 1)
```bash
# Initialize project
npm create vite@latest gym-log -- --template vanilla-ts

# Install dependencies
npm install idb
npm install -D tailwindcss postcss autoprefixer
npm install -D vite-plugin-pwa
npm install -D @playwright/test @cucumber/cucumber playwright-bdd

# Configure Tailwind
npx tailwindcss init -p
```

**Reference:** [06-requirements-spec.md - Next Steps](06-requirements-spec.md#next-steps)

### Phase 2: Core Features (Weeks 2-3)
1. Set up TypeScript types ([IH2](06-requirements-spec.md#ih2-typescript-type-definitions))
2. Create IndexedDB wrapper ([IH3](06-requirements-spec.md#ih3-indexeddb-schema))
3. Build workout logging UI ([UI2](06-requirements-spec.md#ui2-active-workout-screen))
4. Implement data persistence ([FR4](06-requirements-spec.md#fr4-data-persistence))

### Phase 3: Testing (Week 3-4)
1. Start with basic Playwright tests ([07-testing-strategy.md - Week 1](07-testing-strategy.md#week-1-playwright-basics))
2. Add Gherkin scenarios ([08-sample-feature-files.md](08-sample-feature-files.md))
3. Write step definitions
4. Test on mobile viewports

### Phase 4: PWA & Polish (Week 4-5)
1. Configure service worker ([IH4](06-requirements-spec.md#ih4-service-worker-strategy))
2. Add app manifest and icons
3. Implement CSV export ([FR5](06-requirements-spec.md#fr5-csv-export))
4. Test offline functionality
5. Deploy to Netlify/Vercel

---

## Learning Objectives

This project is designed to help you learn:

### Primary Skills
- ✅ TypeScript for web apps
- ✅ Progressive Web App development
- ✅ IndexedDB and offline-first architecture
- ✅ Mobile-first responsive design with Tailwind

### Testing Skills (Bonus)
- ✅ Gherkin/BDD specifications
- ✅ Playwright E2E testing
- ✅ Mobile browser testing
- ✅ Test-driven development workflow

**Full testing guide:** [07-testing-strategy.md](07-testing-strategy.md)

---

## Key Design Decisions

### Why TypeScript?
- Type safety for complex data models (Workout, Exercise, Set)
- Catch bugs at compile time
- Better IDE experience with autocomplete

### Why Tailwind CSS?
- Mobile-first utilities out of the box
- Fast prototyping
- Consistent touch target sizing (44x44px minimum)
- Small bundle size with automatic purging

### Why IndexedDB?
- No storage limits (vs LocalStorage's 5-10MB)
- Asynchronous API (doesn't block UI)
- Better for complex queries
- Standard browser API

### Why No Backend?
- Simpler to build and maintain
- Works offline by default
- No hosting costs
- No privacy concerns (data never leaves device)
- CSV export provides data portability

---

## Acceptance Criteria Checklist

Before considering the project complete, verify:

- [ ] All functional requirements implemented ([FR1-FR6](06-requirements-spec.md#functional-requirements))
- [ ] All technical requirements met ([TR1-TR4](06-requirements-spec.md#technical-requirements))
- [ ] All acceptance criteria pass ([AC1-AC7](06-requirements-spec.md#acceptance-criteria))
- [ ] App works on iOS Safari and Android Chrome
- [ ] App installs to home screen
- [ ] App works completely offline
- [ ] CSV export works correctly
- [ ] No data loss on refresh or restart
- [ ] Touch targets are 44x44px minimum
- [ ] Performance is smooth (60fps)

---

## Resources

### Documentation
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Playwright Docs](https://playwright.dev/)
- [Cucumber/Gherkin Guide](https://cucumber.io/docs/gherkin/)

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Test PWA features
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Audit PWA
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Playwright Test Generator](https://playwright.dev/docs/codegen) - Generate tests

---

## Questions or Issues?

- Review the [06-requirements-spec.md](06-requirements-spec.md) for detailed specifications
- Check [07-testing-strategy.md](07-testing-strategy.md) for testing guidance
- Refer to [08-sample-feature-files.md](08-sample-feature-files.md) for complete Gherkin examples

---

## Project Structure Preview

```
gym-log/
├── src/
│   ├── main.ts              # Entry point
│   ├── types.ts             # TypeScript interfaces
│   ├── db.ts                # IndexedDB wrapper
│   ├── export.ts            # CSV export
│   ├── ui.ts                # UI logic
│   └── utils.ts             # Helpers
├── tests/
│   ├── features/            # Gherkin .feature files
│   ├── step-definitions/    # Playwright step implementations
│   └── fixtures/            # Test data
├── styles/
│   └── main.css             # Tailwind + custom styles
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
├── index.html
├── manifest.json            # PWA manifest
├── vite.config.ts
├── tailwind.config.js
├── playwright.config.ts
└── package.json
```

---

**Ready to start building!** 🚀

Begin with [06-requirements-spec.md](06-requirements-spec.md) and follow the [Next Steps](06-requirements-spec.md#next-steps) section.
