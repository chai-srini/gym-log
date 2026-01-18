# Testing Strategy with Gherkin & Playwright

**Project:** Gym Workout Logger
**Purpose:** Learn BDD with Gherkin and E2E testing with Playwright while building the app
**Date:** 2026-01-18

---

## Learning Objectives

1. **Gherkin/BDD** - Learn to write behavior specifications in Given-When-Then format
2. **Playwright** - Learn end-to-end testing for web applications
3. **Test-Driven Development** - Write tests alongside or after features
4. **Mobile Testing** - Learn mobile browser testing with Playwright

---

## Testing Stack

### Core Tools
- **Playwright** - E2E testing framework with excellent mobile support
- **@cucumber/cucumber** - Gherkin parser and test runner (optional, can use Playwright's built-in BDD style)
- **playwright-bdd** - Bridge between Cucumber and Playwright (recommended)

### Alternative Approach
- Use Playwright's native test format with BDD-style assertions (simpler to start)
- Add Cucumber/Gherkin later if you want the full BDD experience

---

## Project Structure with Tests

```
/
├── src/                    # Application code
├── tests/
│   ├── features/          # Gherkin feature files
│   │   ├── workout.feature
│   │   ├── exercise-library.feature
│   │   ├── csv-export.feature
│   │   └── offline.feature
│   ├── step-definitions/  # Step implementations
│   │   ├── workout.steps.ts
│   │   ├── exercise.steps.ts
│   │   ├── export.steps.ts
│   │   └── common.steps.ts
│   ├── fixtures/          # Test data
│   │   └── sample-workouts.json
│   └── helpers/           # Test utilities
│       └── db-helper.ts
├── playwright.config.ts   # Playwright configuration
└── package.json
```

---

## Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Optional: Install Cucumber integration
npm install -D @cucumber/cucumber playwright-bdd

# Install testing utilities
npm install -D @faker-js/faker  # Generate test data
```

---

## Learning Path

### Phase 1: Start Simple (Recommended for Learning)
**Week 1-2: Basic Playwright Tests**
- Write basic Playwright tests in TypeScript (no Gherkin yet)
- Learn Playwright selectors, assertions, and mobile testing
- Test one feature: "Create a workout"

### Phase 2: Add Gherkin
**Week 3: Introduce BDD**
- Convert existing tests to Gherkin scenarios
- Learn Given-When-Then syntax
- Understand step definitions

### Phase 3: Full BDD Workflow
**Week 4+: Complete Test Suite**
- Write Gherkin scenarios BEFORE implementing features
- Use scenarios as living documentation
- Test all acceptance criteria

---

## Sample Configuration

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile browsers (primary targets)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Example: Workout Feature in Gherkin

### tests/features/workout.feature
```gherkin
Feature: Workout Session Management
  As a gym user
  I want to log my workout sessions
  So that I can track my progress over time

  Background:
    Given the app is installed and opened
    And the exercise library contains common exercises

  Scenario: Create a new workout session
    Given I am on the home screen
    When I tap "Start New Workout"
    Then I should see the workout session screen
    And the timer should start automatically
    And I should see "Add Exercise" button

  Scenario: Add exercise with sets to workout
    Given I have started a new workout
    When I tap "Add Exercise"
    And I select "Bench Press" from the exercise list
    And I enter the following set:
      | weight | reps | rpe | rest |
      | 185    | 8    | 80  | 60   |
    And I tap "Add Set"
    Then I should see the set added to "Bench Press"
    And the set should show "185 lbs × 8 reps @ 80% RPE, 60s rest"

  Scenario: Pre-fill values from previous set
    Given I have added a set with weight 185, reps 8, RPE 80, rest 60
    When I start entering a new set
    Then the weight field should pre-fill with "185"
    And the reps field should pre-fill with "8"
    And the RPE field should pre-fill with "80"
    And the rest time field should pre-fill with "60"

  Scenario: Complete workout and save
    Given I have added 2 exercises with 3 sets each
    And the workout duration is 45 minutes
    When I tap "Complete Workout"
    And I optionally enter notes "Great session today"
    And I tap "Save"
    Then the workout should be saved to local storage
    And I should see the workout in my history
    And the workout should show "2 exercises, 45 min"

  Scenario: Workout persists after app restart
    Given I have completed and saved a workout
    When I close and reopen the app
    Then I should see my workout in the history
    And all exercise and set data should be intact

  Scenario: Cancel workout without saving
    Given I have started a workout with some exercises
    When I tap "Cancel Workout"
    And I confirm the cancellation
    Then the workout should not be saved
    And I should return to the home screen
    And my history should not show the cancelled workout
```

---

## Example: Playwright Test (Simple Style)

### tests/workout.spec.ts (No Gherkin)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Workout Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new workout session', async ({ page }) => {
    // Given I am on the home screen
    await expect(page.locator('h1')).toContainText('Gym Logger');

    // When I tap "Start New Workout"
    await page.getByRole('button', { name: 'Start New Workout' }).click();

    // Then I should see the workout session screen
    await expect(page.locator('[data-testid="workout-screen"]')).toBeVisible();

    // And the timer should start automatically
    await expect(page.locator('[data-testid="timer"]')).toBeVisible();

    // And I should see "Add Exercise" button
    await expect(page.getByRole('button', { name: 'Add Exercise' })).toBeVisible();
  });

  test('should add exercise with sets to workout', async ({ page }) => {
    // Start workout
    await page.getByRole('button', { name: 'Start New Workout' }).click();

    // Add exercise
    await page.getByRole('button', { name: 'Add Exercise' }).click();
    await page.getByRole('option', { name: 'Bench Press' }).click();

    // Enter set data
    await page.getByLabel('Weight').fill('185');
    await page.getByLabel('Reps').fill('8');
    await page.getByLabel('RPE').fill('80');
    await page.getByLabel('Rest (seconds)').fill('60');

    // Add set
    await page.getByRole('button', { name: 'Add Set' }).click();

    // Verify set was added
    await expect(page.locator('[data-testid="set-1"]')).toContainText('185 lbs × 8 reps');
  });

  test('should persist workout after restart', async ({ page, context }) => {
    // Create and save workout
    await page.getByRole('button', { name: 'Start New Workout' }).click();
    await page.getByRole('button', { name: 'Add Exercise' }).click();
    await page.getByRole('option', { name: 'Bench Press' }).click();
    await page.getByLabel('Weight').fill('185');
    await page.getByLabel('Reps').fill('8');
    await page.getByRole('button', { name: 'Add Set' }).click();
    await page.getByRole('button', { name: 'Complete Workout' }).click();

    // Close and reopen (simulate restart)
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Verify workout is in history
    await newPage.getByRole('link', { name: 'History' }).click();
    await expect(newPage.locator('[data-testid="workout-list"]')).toContainText('Bench Press');
  });
});
```

---

## Example: Playwright + Gherkin (BDD Style)

### tests/step-definitions/workout.steps.ts
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the home screen', async function () {
  await this.page.goto('/');
  await expect(this.page.locator('h1')).toContainText('Gym Logger');
});

Given('the app is installed and opened', async function () {
  await this.page.goto('/');
});

Given('the exercise library contains common exercises', async function () {
  // Could seed the database here, or verify default exercises exist
  // For now, assume the app comes with default exercises
});

When('I tap {string}', async function (buttonName: string) {
  await this.page.getByRole('button', { name: buttonName }).click();
});

When('I select {string} from the exercise list', async function (exerciseName: string) {
  await this.page.getByRole('option', { name: exerciseName }).click();
});

When('I enter the following set:', async function (dataTable) {
  const [row] = dataTable.hashes();
  await this.page.getByLabel('Weight').fill(row.weight);
  await this.page.getByLabel('Reps').fill(row.reps);
  await this.page.getByLabel('RPE').fill(row.rpe);
  await this.page.getByLabel('Rest (seconds)').fill(row.rest);
});

Then('I should see the workout session screen', async function () {
  await expect(this.page.locator('[data-testid="workout-screen"]')).toBeVisible();
});

Then('the timer should start automatically', async function () {
  await expect(this.page.locator('[data-testid="timer"]')).toBeVisible();
});

Then('I should see {string} button', async function (buttonName: string) {
  await expect(this.page.getByRole('button', { name: buttonName })).toBeVisible();
});

Then('I should see the set added to {string}', async function (exerciseName: string) {
  await expect(
    this.page.locator(`[data-testid="exercise-${exerciseName}"]`)
  ).toBeVisible();
});
```

---

## Learning Resources

### Gherkin
- [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Writing Better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/)
- Practice: Start with simple scenarios, add complexity gradually

### Playwright
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Mobile Testing Guide](https://playwright.dev/docs/emulation)

### BDD Concepts
- [BDD Introduction](https://cucumber.io/docs/bdd/)
- Focus on behavior (what), not implementation (how)
- Write scenarios from user perspective

---

## Testing Checklist for Learning

### Week 1: Playwright Basics
- [ ] Install Playwright and run example tests
- [ ] Write test for "Start New Workout" flow
- [ ] Learn selectors: getByRole, getByLabel, getByTestId
- [ ] Learn assertions: toBeVisible, toContainText, toHaveValue
- [ ] Test on mobile viewports (iPhone, Android)

### Week 2: More Complex Tests
- [ ] Test adding exercises and sets
- [ ] Test data persistence (IndexedDB)
- [ ] Test CSV export functionality
- [ ] Learn Playwright fixtures for test data

### Week 3: Introduce Gherkin
- [ ] Install Cucumber/playwright-bdd
- [ ] Convert one test to Gherkin format
- [ ] Write step definitions
- [ ] Run Gherkin scenarios

### Week 4: Full BDD Workflow
- [ ] Write Gherkin scenarios for all features
- [ ] Use scenarios as specification
- [ ] Generate test reports
- [ ] Practice writing clear, reusable steps

---

## Tips for Learning

1. **Start Simple** - Don't use Gherkin immediately. Get comfortable with Playwright first.

2. **Use Test IDs** - Add `data-testid` attributes to your components for reliable selection:
   ```html
   <button data-testid="start-workout-btn">Start Workout</button>
   ```

3. **Mobile First** - Configure Playwright to test mobile viewports from the start

4. **Watch Tests Run** - Use `npx playwright test --headed` to see tests execute

5. **Debug Mode** - Use `npx playwright test --debug` when tests fail

6. **Generate Tests** - Use `npx playwright codegen` to record interactions and generate test code

7. **Iterate** - Write test, run test, improve test. Don't aim for perfection initially.

---

## Recommended Learning Order

1. **Build without tests first** (1-2 features)
   - Understand the app structure
   - Get comfortable with TypeScript + Tailwind

2. **Add basic Playwright tests**
   - Simple E2E tests without Gherkin
   - Learn the testing mindset

3. **Introduce Gherkin**
   - Convert existing tests
   - Learn BDD syntax

4. **Test-drive new features**
   - Write scenarios before code
   - Implement, test, refine

---

## Success Metrics

- [ ] All acceptance criteria have corresponding Gherkin scenarios
- [ ] Tests run on both iOS Safari and Android Chrome emulation
- [ ] Tests cover happy path and edge cases
- [ ] Tests run in CI/CD pipeline (future)
- [ ] You understand BDD principles and Playwright API
- [ ] You can write new scenarios confidently

---

**Next:** Ready to add testing to the project structure and package.json?
