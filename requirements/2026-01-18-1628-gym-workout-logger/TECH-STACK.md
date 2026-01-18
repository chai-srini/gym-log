# Technology Stack

**Project:** Gym Workout Logger
**Updated:** 2026-01-18

## Confirmed Technologies

### Language & Framework
- **TypeScript** - Type safety for data models, better IDE support, compile-time error checking
- **React** (optional) or **Vanilla TypeScript** - To be decided during implementation

### Build Tool
- **Vite** - Fast development, great TypeScript support, excellent PWA plugin

### CSS Framework
- **Tailwind CSS** - Mobile-first utilities, rapid prototyping, small bundle size

### Data Storage
- **IndexedDB** with wrapper library (`idb` or `Dexie.js`) - Local data persistence

### PWA Support
- **vite-plugin-pwa** - Service worker generation and PWA manifest

### Testing (Learning Objective)
- **Playwright** - End-to-end testing with mobile browser support
- **Cucumber/Gherkin** - BDD specifications in Given-When-Then format
- **playwright-bdd** - Bridge between Cucumber and Playwright

## Key Dependencies

```json
{
  "dependencies": {
    "idb": "^8.x" // or "dexie": "^4.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "vite-plugin-pwa": "^0.x",
    "@playwright/test": "^1.x",
    "@cucumber/cucumber": "^10.x",
    "playwright-bdd": "^6.x",
    "@faker-js/faker": "^8.x"
  }
}
```

## File Extensions
- TypeScript files: `.ts`
- React components (if used): `.tsx`
- CSS files: `.css` (with Tailwind directives)
- Config files: `.js` or `.ts`

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run tests on mobile viewports
npm run test:mobile

# Open Playwright UI
npm run test:ui
```

## Browser Targets
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

## Deployment Platforms
- GitHub Pages
- Netlify
- Vercel

All support static hosting with zero configuration.
