# Sample Gherkin Feature Files

Complete Gherkin scenarios for all major features of the Gym Workout Logger.

---

## 1. Exercise Library Management

```gherkin
Feature: Exercise Library Management
  As a gym user
  I want to manage my exercise library
  So that I can quickly select exercises during workouts

  Background:
    Given the app has pre-loaded common exercises
    And I am on the home screen

  Scenario: View pre-loaded exercises
    When I navigate to "Exercise Library"
    Then I should see at least 15 exercises
    And I should see "Bench Press"
    And I should see "Squat"
    And I should see "Deadlift"

  Scenario: Add custom exercise
    Given I am on the Exercise Library screen
    When I tap "Add Custom Exercise"
    And I enter exercise name "Bulgarian Split Squat"
    And I tap "Save"
    Then I should see "Bulgarian Split Squat" in the exercise list
    And the exercise should persist after app restart

  Scenario: Search for exercise
    Given I am on the Exercise Library screen
    And the library contains 20 exercises
    When I type "press" in the search box
    Then I should see "Bench Press"
    And I should see "Overhead Press"
    And I should not see "Squat"

  Scenario: Recently used exercises appear first
    Given I have used "Bench Press" 5 times
    And I have used "Squat" 3 times
    And I have never used "Leg Press"
    When I open the exercise selector during a workout
    Then "Bench Press" should appear first
    And "Squat" should appear second
    And "Leg Press" should appear later in the list

  Scenario: Exercise use count increments
    Given "Deadlift" has been used 0 times
    When I add "Deadlift" to a workout
    And I complete the workout
    Then "Deadlift" use count should be 1
    When I add "Deadlift" to another workout
    And I complete the workout
    Then "Deadlift" use count should be 2
```

---

## 2. Set Tracking and Defaults

```gherkin
Feature: Set Tracking with Smart Defaults
  As a gym user
  I want to quickly log sets with default values
  So that I can minimize data entry during workouts

  Background:
    Given I have started a new workout
    And I have added "Bench Press" to the workout

  Scenario: First set uses global defaults
    When I start entering the first set
    Then the RPE field should default to 80
    And the rest time field should default to 60 seconds
    And the weight field should be empty
    And the reps field should be empty

  Scenario: Subsequent sets inherit previous set values
    Given I have added a set with:
      | weight | reps | rpe | rest |
      | 185    | 8    | 75  | 120  |
    When I start entering the second set
    Then the weight field should default to 185
    And the reps field should default to 8
    And the RPE field should default to 75
    And the rest time field should default to 120

  Scenario: Edit set after adding
    Given I have added a set with weight 185, reps 8
    When I tap on the set
    And I change the weight to 190
    And I change the reps to 7
    And I tap "Save"
    Then the set should show weight 190 and reps 7

  Scenario: Delete individual set
    Given I have added 3 sets to "Bench Press"
    When I swipe left on set 2
    And I tap "Delete"
    And I confirm the deletion
    Then I should see only 2 sets
    And the remaining sets should be numbered 1 and 2

  Scenario: Set validation
    When I try to add a set with empty weight
    Then I should see an error "Weight is required"
    When I try to add a set with empty reps
    Then I should see an error "Reps is required"
    When I try to add a set with RPE > 100
    Then I should see an error "RPE must be between 1 and 100"
```

---

## 3. Quick Start Feature

```gherkin
Feature: Quick Start from Previous Workout
  As a gym user following a consistent routine
  I want to copy my last workout
  So that I can quickly start without re-entering exercises

  Background:
    Given I have completed a workout with:
      | exercise       | sets | weight | reps |
      | Bench Press    | 3    | 185    | 8    |
      | Barbell Row    | 3    | 135    | 10   |
      | Overhead Press | 3    | 95     | 8    |
    And I am on the home screen

  Scenario: Quick start button is visible
    When I view the home screen
    Then I should see a "Quick Start" button
    And it should show "Last: 3 exercises"

  Scenario: Copy last workout as template
    When I tap "Quick Start"
    Then I should see a new workout session
    And the workout should contain "Bench Press"
    And the workout should contain "Barbell Row"
    And the workout should contain "Overhead Press"
    And all exercises should have empty sets (not copied)
    And the timer should start

  Scenario: Pre-fill first set from last workout
    Given I have started a workout via "Quick Start"
    And the last "Bench Press" workout had sets with weight 185
    When I start entering the first set for "Bench Press"
    Then the weight should pre-fill with 185
    And the reps should pre-fill with 8

  Scenario: Modify quick-started workout
    Given I have started a workout via "Quick Start"
    When I remove "Barbell Row" from the workout
    And I add "Dumbbell Curl" to the workout
    And I complete the workout
    Then my history should show the modified workout
    And the next "Quick Start" should use the new workout as template

  Scenario: Quick start when no previous workouts
    Given I have never completed a workout
    When I tap "Quick Start"
    Then I should see a message "No previous workouts found"
    And I should be prompted to "Start New Workout" instead
```

---

## 4. CSV Export

```gherkin
Feature: CSV Export for Data Analysis
  As a gym user
  I want to export my workout data to CSV
  So that I can analyze it in Google Sheets

  Background:
    Given I have completed multiple workouts

  Scenario: Export all workouts to CSV
    Given I have 5 completed workouts in my history
    When I navigate to Settings
    And I tap "Export Data to CSV"
    Then a CSV file should download
    And the filename should include today's date
    And the filename should match "gym-log-YYYY-MM-DD.csv"

  Scenario: CSV format structure
    Given I have a workout with:
      | exercise    | set | weight | reps | rpe | rest |
      | Bench Press | 1   | 185    | 8    | 80  | 60   |
      | Bench Press | 2   | 185    | 7    | 85  | 60   |
    When I export to CSV
    Then the CSV should have headers:
      | Date | Exercise | Set | Weight | Reps | RPE | Rest | Notes |
    And row 1 should contain:
      | 2026-01-18 | Bench Press | 1 | 185 | 8 | 80 | 60 | |
    And row 2 should contain:
      | 2026-01-18 | Bench Press | 2 | 185 | 7 | 85 | 60 | |

  Scenario: CSV handles special characters
    Given I have a workout with notes "Great session, hit PR!"
    When I export to CSV
    Then the notes field should be properly escaped
    And the CSV should be valid for Google Sheets import

  Scenario: Export empty data
    Given I have no completed workouts
    When I tap "Export Data to CSV"
    Then I should see a message "No workouts to export"
    And no file should download

  Scenario: CSV includes all historical data
    Given I have workouts from 3 months ago
    When I export to CSV
    Then all historical workouts should be included
    And workouts should be sorted by date (oldest first)
```

---

## 5. Workout History

```gherkin
Feature: Workout History Management
  As a gym user
  I want to view, edit, and delete past workouts
  So that I can review progress and fix mistakes

  Background:
    Given I have completed 10 workouts
    And I am on the History screen

  Scenario: View workout list
    Then I should see 10 workout entries
    And each entry should show the date
    And each entry should show the duration
    And each entry should show the exercise count
    And workouts should be sorted newest first

  Scenario: View workout details
    When I tap on a workout from "2026-01-15"
    Then I should see all exercises from that workout
    And I should see all sets with weight, reps, RPE, and rest time
    And I should see workout notes if any

  Scenario: Edit past workout
    Given I am viewing a workout from yesterday
    When I tap "Edit"
    And I change the weight of set 2 from 185 to 190
    And I tap "Save"
    Then the set should show weight 190
    And the change should persist

  Scenario: Add exercise to past workout
    Given I am editing a workout from yesterday
    When I tap "Add Exercise"
    And I select "Dumbbell Curl"
    And I add 2 sets
    And I save the workout
    Then the workout should show the new exercise
    And the exercise count should increase by 1

  Scenario: Delete past workout
    Given I am viewing a workout from last week
    When I tap "Delete Workout"
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then the workout should be removed from history
    And I should return to the history list
    And the workout should not appear in CSV exports

  Scenario: Search workout history
    Given I have workouts containing "Bench Press"
    And I have workouts containing only "Deadlift"
    When I search for "Bench"
    Then I should see only workouts with "Bench Press"
    And I should not see "Deadlift" only workouts

  Scenario: Filter by date range
    Given I have workouts from "2026-01-01" to "2026-01-18"
    When I filter by date range "2026-01-10" to "2026-01-15"
    Then I should see only workouts in that range
    And I should see at least 1 workout
```

---

## 6. Progressive Web App Features

```gherkin
Feature: Progressive Web App Capabilities
  As a mobile user
  I want the app to work offline and be installable
  So that I can use it like a native app in the gym

  Scenario: Install app to home screen (iOS)
    Given I am using iOS Safari
    And I have loaded the app
    When I tap the share button
    And I tap "Add to Home Screen"
    And I confirm the installation
    Then the app should appear on my home screen
    And the app icon should be visible
    And the app name should be "Gym Logger"

  Scenario: Install app to home screen (Android)
    Given I am using Android Chrome
    When I visit the app
    Then I should see an install prompt
    When I tap "Install"
    Then the app should be added to my home screen
    And it should open in standalone mode

  Scenario: App works completely offline
    Given I have loaded the app while online
    And I have enabled airplane mode
    When I open the app
    Then the app should load successfully
    And I should see all my previous workouts
    When I create a new workout
    And I add exercises and sets
    And I complete the workout
    Then the workout should save to local storage
    And it should appear in my history

  Scenario: Service worker caches assets
    Given I have visited the app once while online
    When I go offline
    And I refresh the page
    Then the app should load from cache
    And all functionality should work
    And I should see no network errors

  Scenario: App opens in standalone mode
    Given I have installed the app to my home screen
    When I open the app from the home screen
    Then the browser UI should not be visible
    And the app should appear fullscreen
    And the status bar should match the app theme

  Scenario: Data persists across app restarts
    Given I have logged a workout
    When I close the app completely
    And I reopen the app from the home screen
    Then my workout history should be intact
    And all exercise data should be present
    And my custom exercises should be available
```

---

## 7. Settings and Preferences

```gherkin
Feature: App Settings and Preferences
  As a gym user
  I want to customize app settings
  So that the app works the way I prefer

  Background:
    Given I am on the Settings screen

  Scenario: Change weight unit to kilograms
    Given the current weight unit is "lbs"
    When I tap the weight unit toggle
    And I select "kg"
    Then all weights should display in kilograms
    And new set entries should use kilograms
    And the setting should persist after app restart

  Scenario: Change default RPE
    Given the default RPE is 80
    When I change the default RPE to 70
    And I save settings
    Then new sets should default to RPE 70
    And existing workouts should remain unchanged

  Scenario: Change default rest time
    Given the default rest time is 60 seconds
    When I change the default rest time to 90 seconds
    And I save settings
    Then new sets should default to 90 seconds rest
    And existing workouts should remain unchanged

  Scenario: Clear all data
    Given I have 10 completed workouts
    When I tap "Clear All Data"
    Then I should see a strong warning message
    When I type "DELETE" to confirm
    And I tap "Confirm Delete"
    Then all workouts should be deleted
    And all custom exercises should be deleted
    And I should see an empty history
    And settings should reset to defaults

  Scenario: View app version
    When I scroll to the bottom of Settings
    Then I should see "Version" information
    And it should show the current app version number
```

---

## Running These Tests

```bash
# Run all features
npx cucumber-js

# Run specific feature
npx cucumber-js tests/features/workout.feature

# Run specific scenario
npx cucumber-js tests/features/workout.feature:10

# Run on mobile viewport
npx playwright test --project="Mobile Chrome"

# Run with headed browser
npx playwright test --headed

# Generate HTML report
npx playwright test --reporter=html
```

---

These feature files provide comprehensive coverage of all acceptance criteria and serve as:
1. **Executable specifications** - Can be automated with Playwright
2. **Living documentation** - Always up-to-date with implementation
3. **Learning examples** - Show Gherkin best practices
4. **Requirement validation** - Ensure nothing is missed
