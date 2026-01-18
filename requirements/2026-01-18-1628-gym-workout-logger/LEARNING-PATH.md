# Learning Path: Gherkin & Playwright with Gym Logger

A structured, week-by-week plan for learning BDD and E2E testing while building the Gym Workout Logger app.

---

## Overview

**Duration:** 4-5 weeks
**Time Commitment:** 10-15 hours/week
**Prerequisites:** Basic TypeScript/JavaScript knowledge
**Learning Style:** Build → Test → Learn → Repeat

---

## Week 1: Foundation (No Testing Yet)

### Goal
Build basic app structure and understand the codebase before adding tests.

### Tasks
- [ ] Initialize Vite + TypeScript project
- [ ] Set up Tailwind CSS
- [ ] Create TypeScript type definitions (`types.ts`)
- [ ] Set up IndexedDB wrapper (basic CRUD)
- [ ] Build simple UI for creating a workout
- [ ] Test manually in browser

### What You'll Learn
- Vite project structure
- TypeScript interfaces
- IndexedDB basics
- Tailwind utility classes

### Deliverable
A working app where you can:
- Start a workout
- Add one exercise
- Add one set
- Save to IndexedDB

**Time:** ~12 hours

---

## Week 2: First Playwright Tests

### Goal
Learn Playwright basics without Gherkin. Test what you built in Week 1.

### Setup
```bash
npm install -D @playwright/test
npx playwright install
npx playwright test --ui
```

### Tasks
- [ ] Install Playwright
- [ ] Create `playwright.config.ts`
- [ ] Write first test: "can start a new workout"
- [ ] Write second test: "can add exercise to workout"
- [ ] Write third test: "data persists after refresh"
- [ ] Learn Playwright selectors (getByRole, getByLabel, getByTestId)
- [ ] Add `data-testid` attributes to key elements

### Learning Resources
- [Playwright Getting Started](https://playwright.dev/docs/intro)
- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

### Example Test
```typescript
import { test, expect } from '@playwright/test';

test('can start a new workout', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Click start workout button
  await page.getByRole('button', { name: 'Start New Workout' }).click();

  // Verify workout screen appears
  await expect(page.locator('[data-testid="workout-screen"]')).toBeVisible();

  // Verify timer started
  await expect(page.locator('[data-testid="timer"]')).toBeVisible();
});
```

### Deliverable
3-5 basic Playwright tests that verify core functionality.

**Time:** ~10 hours

---

## Week 3: Introduction to Gherkin

### Goal
Learn BDD concepts and convert existing tests to Gherkin format.

### Setup
```bash
npm install -D @cucumber/cucumber playwright-bdd
npx bdd-gen
```

### Tasks
- [ ] Read Cucumber Gherkin documentation
- [ ] Write your first `.feature` file
- [ ] Convert one Playwright test to Gherkin + step definitions
- [ ] Understand Given-When-Then structure
- [ ] Write step definitions for common actions
- [ ] Run Gherkin scenarios with Playwright

### Learning Resources
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [playwright-bdd Documentation](https://github.com/vitalets/playwright-bdd)
- Review [08-sample-feature-files.md](08-sample-feature-files.md)

### Example Workflow

**1. Write Feature File** (`tests/features/workout.feature`)
```gherkin
Feature: Create Workout

  Scenario: User starts a new workout
    Given I am on the home screen
    When I tap "Start New Workout"
    Then I should see the workout screen
    And the timer should be running
```

**2. Implement Steps** (`tests/step-definitions/workout.steps.ts`)
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the home screen', async function () {
  await this.page.goto('/');
});

When('I tap {string}', async function (buttonName: string) {
  await this.page.getByRole('button', { name: buttonName }).click();
});

Then('I should see the workout screen', async function () {
  await expect(this.page.locator('[data-testid="workout-screen"]')).toBeVisible();
});

Then('the timer should be running', async function () {
  await expect(this.page.locator('[data-testid="timer"]')).toBeVisible();
});
```

**3. Run Tests**
```bash
npx bdd-test
```

### Deliverable
- 2-3 feature files with scenarios
- Step definitions for common actions
- All tests passing

**Time:** ~12 hours

---

## Week 4: Full BDD Workflow

### Goal
Write Gherkin scenarios BEFORE implementing features. Use TDD approach.

### Process
1. **Red:** Write Gherkin scenario for a new feature
2. **Red:** Run test (it fails - feature not built yet)
3. **Green:** Implement the feature
4. **Green:** Run test (it passes)
5. **Refactor:** Clean up code
6. **Document:** Scenario serves as documentation

### Tasks
- [ ] Pick unimplemented feature (e.g., "Quick Start")
- [ ] Write Gherkin scenarios FIRST
- [ ] Write step definitions
- [ ] Run tests (watch them fail)
- [ ] Implement the feature
- [ ] Run tests (watch them pass)
- [ ] Repeat for 2-3 more features

### Example: TDD with Gherkin

**1. Write Scenario (before coding)**
```gherkin
Feature: Quick Start

  Scenario: Copy last workout
    Given I have completed a workout yesterday
    When I tap "Quick Start"
    Then I should see a new workout with the same exercises
    But the sets should be empty
```

**2. Implement Steps**
```typescript
Given('I have completed a workout yesterday', async function () {
  // Use test helper to seed database
  await this.dbHelper.createWorkout({
    date: '2026-01-17',
    exercises: [{ name: 'Bench Press', sets: [...] }]
  });
});

When('I tap {string}', async function (buttonName) {
  await this.page.getByRole('button', { name: buttonName }).click();
});

Then('I should see a new workout with the same exercises', async function () {
  await expect(this.page.locator('text=Bench Press')).toBeVisible();
});

Then('the sets should be empty', async function () {
  const setCount = await this.page.locator('[data-testid="set-item"]').count();
  expect(setCount).toBe(0);
});
```

**3. Run Test (Red)**
```bash
npx bdd-test
# ❌ Test fails - Quick Start feature doesn't exist yet
```

**4. Implement Feature**
Build the Quick Start functionality in your app.

**5. Run Test (Green)**
```bash
npx bdd-test
# ✅ Test passes - Feature works as specified
```

### Deliverable
- 3+ features built using TDD approach
- Complete feature file coverage
- All acceptance criteria tested

**Time:** ~15 hours

---

## Week 5: Advanced Testing & Polish

### Goal
Complete test coverage, learn advanced Playwright features, and set up CI.

### Tasks
- [ ] Add mobile viewport testing
- [ ] Test offline functionality (service worker)
- [ ] Test CSV export with file downloads
- [ ] Add fixtures for test data
- [ ] Learn Playwright debugging tools
- [ ] Set up GitHub Actions for CI (optional)
- [ ] Generate test report

### Advanced Playwright Features

**Mobile Testing**
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

**Offline Testing**
```typescript
test('works offline', async ({ context, page }) => {
  await page.goto('/');

  // Go offline
  await context.setOffline(true);

  // Create workout
  await page.getByRole('button', { name: 'Start New Workout' }).click();
  await page.getByRole('button', { name: 'Add Exercise' }).click();

  // Verify it works
  await expect(page.locator('[data-testid="exercise-list"]')).toBeVisible();
});
```

**Download Testing**
```typescript
test('can export CSV', async ({ page }) => {
  await page.goto('/settings');

  // Start waiting for download before clicking
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Data' }).click();
  const download = await downloadPromise;

  // Verify filename
  expect(download.suggestedFilename()).toMatch(/gym-log-\d{4}-\d{2}-\d{2}\.csv/);

  // Save and verify content
  const path = await download.path();
  const content = await fs.readFile(path, 'utf-8');
  expect(content).toContain('Date,Exercise,Set,Weight,Reps');
});
```

### Deliverable
- Complete test suite covering all features
- Tests passing on mobile viewports
- Offline functionality tested
- Professional test report

**Time:** ~12 hours

---

## Learning Checkpoints

After each week, you should be able to:

### ✅ Week 1
- [ ] Explain TypeScript interfaces
- [ ] Use Tailwind utility classes
- [ ] Perform basic IndexedDB operations
- [ ] Build a simple form with validation

### ✅ Week 2
- [ ] Write basic Playwright tests
- [ ] Use different selector strategies
- [ ] Debug failing tests
- [ ] Understand async/await in tests

### ✅ Week 3
- [ ] Write Gherkin scenarios in Given-When-Then format
- [ ] Implement step definitions
- [ ] Run BDD tests with playwright-bdd
- [ ] Understand the difference between scenario and test

### ✅ Week 4
- [ ] Practice Test-Driven Development
- [ ] Write scenarios before code
- [ ] Use Gherkin as living documentation
- [ ] Refactor code without breaking tests

### ✅ Week 5
- [ ] Test mobile-specific functionality
- [ ] Test offline/PWA features
- [ ] Test file downloads
- [ ] Read and understand test reports

---

## Common Pitfalls & Solutions

### Pitfall 1: Writing Too Technical Scenarios
❌ **Bad:**
```gherkin
When I click the button with ID "start-workout-btn"
Then the div with class "workout-screen" should have display: block
```

✅ **Good:**
```gherkin
When I tap "Start Workout"
Then I should see the workout screen
```

### Pitfall 2: Testing Implementation Instead of Behavior
❌ **Bad:**
```gherkin
Then the workout object should be stored in IndexedDB
And the workouts array should have length 1
```

✅ **Good:**
```gherkin
Then I should see the workout in my history
And the history should show 1 workout
```

### Pitfall 3: Flaky Tests Due to Timing
❌ **Bad:**
```typescript
await page.click('button');
await page.locator('.result').textContent(); // May fail if slow
```

✅ **Good:**
```typescript
await page.click('button');
await expect(page.locator('.result')).toBeVisible(); // Waits automatically
```

---

## Recommended Study Resources

### 📚 Reading
1. **Gherkin Basics** - [Cucumber.io Gherkin Reference](https://cucumber.io/docs/gherkin/) (1 hour)
2. **BDD Principles** - [Cucumber BDD Guide](https://cucumber.io/docs/bdd/) (2 hours)
3. **Playwright Guide** - [Official Documentation](https://playwright.dev/docs/intro) (3 hours)

### 🎥 Videos
1. [Playwright Tutorial for Beginners](https://www.youtube.com/results?search_query=playwright+tutorial) (YouTube)
2. [BDD with Cucumber](https://www.youtube.com/results?search_query=bdd+cucumber+tutorial) (YouTube)

### 💻 Practice
1. **Playwright's Built-in Examples** - Run `npx playwright test` after install
2. **Test Your Own App** - Best way to learn!

---

## Weekly Time Breakdown

| Week | App Dev | Testing | Learning | Total |
|------|---------|---------|----------|-------|
| 1    | 10h     | 0h      | 2h       | 12h   |
| 2    | 3h      | 5h      | 2h       | 10h   |
| 3    | 4h      | 6h      | 2h       | 12h   |
| 4    | 8h      | 5h      | 2h       | 15h   |
| 5    | 2h      | 8h      | 2h       | 12h   |
| **Total** | **27h** | **24h** | **10h** | **61h** |

---

## Success Criteria

You'll know you've successfully learned Gherkin + Playwright when you can:

- [ ] Write clear, behavior-focused Gherkin scenarios
- [ ] Implement step definitions without copying examples
- [ ] Debug failing tests efficiently
- [ ] Test mobile-specific functionality
- [ ] Explain the value of BDD to someone else
- [ ] Prefer writing tests over manual testing
- [ ] Use tests as documentation
- [ ] Practice TDD confidently

---

## Next Steps After Completion

1. **Share Your Work**
   - Push to GitHub with test reports
   - Write a blog post about what you learned
   - Show off your test-driven app!

2. **Advanced Topics**
   - Visual regression testing (Playwright screenshots)
   - Performance testing (Lighthouse CI)
   - Accessibility testing (Playwright's accessibility features)
   - API mocking for future features

3. **Apply to Other Projects**
   - Use BDD for your next project from day one
   - Introduce testing to an existing project
   - Mentor others learning testing

---

**Ready to start?** Begin with Week 1 and build your foundation! 🚀

Remember: **The goal is learning, not perfection.** Take your time, experiment, break things, and learn from failures.
