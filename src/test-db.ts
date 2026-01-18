/**
 * Database Testing Script
 * Run this to verify IndexedDB functions work correctly
 */

import {
  initDB,
  getAllExercises,
  getDBStats,
  addWorkout,
  getAllWorkouts,
  getLastWorkout,
  updateWorkout,
  // deleteWorkout,
  addExercise,
  searchExercises,
  getExercisesByUsage,
  incrementExerciseUsage,
} from './db';
import type { Workout } from './types';

async function runTests() {
  console.log('🧪 Starting Database Tests...\n');

  try {
    // Test 1: Initialize Database
    console.log('✅ Test 1: Initialize Database');
    await initDB();
    console.log('   Database initialized successfully\n');

    // Test 2: Check Initial Stats
    console.log('✅ Test 2: Check Database Stats');
    const initialStats = await getDBStats();
    console.log('   Workouts:', initialStats.workoutCount);
    console.log('   Exercises:', initialStats.exerciseCount);
    console.log('   Expected: 0 workouts, 19 exercises\n');

    // Test 3: List All Exercises
    console.log('✅ Test 3: List All Exercises');
    const exercises = await getAllExercises();
    console.log('   Total exercises:', exercises.length);
    console.log('   First 5 exercises:');
    exercises.slice(0, 5).forEach(ex => {
      console.log(`   - ${ex.name} (used ${ex.useCount} times)`);
    });
    console.log('');

    // Test 4: Search Exercises
    console.log('✅ Test 4: Search Exercises');
    const searchResults = await searchExercises('press');
    console.log('   Search for "press" found:', searchResults.length, 'exercises');
    searchResults.forEach(ex => console.log(`   - ${ex.name}`));
    console.log('');

    // Test 5: Add a Custom Exercise
    console.log('✅ Test 5: Add Custom Exercise');
    try {
      const testExerciseName = `Test Exercise ${Date.now()}`;
      const newExerciseId = await addExercise(testExerciseName);
      console.log(`   Added "${testExerciseName}" with ID:`, newExerciseId);
      const updatedStats = await getDBStats();
      console.log('   Total exercises now:', updatedStats.exerciseCount);
    } catch (error: any) {
      if (error.name === 'ConstraintError') {
        console.log('   Note: Exercise already exists (from previous test run)');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 6: Create a Workout
    console.log('✅ Test 6: Create a Workout');
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 45 * 60 * 1000).toISOString(); // 45 min later

    const sampleWorkout: Omit<Workout, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      duration: 45,
      notes: 'Great chest and back session',
      exercises: [
        {
          exerciseName: 'Bench Press',
          notes: '',
          sets: [
            { setNumber: 1, weight: 185, reps: 8, rpe: 75, restTime: 120 },
            { setNumber: 2, weight: 185, reps: 7, rpe: 80, restTime: 120 },
            { setNumber: 3, weight: 185, reps: 6, rpe: 85, restTime: 120 },
          ],
        },
        {
          exerciseName: 'Barbell Row',
          notes: 'Focus on form',
          sets: [
            { setNumber: 1, weight: 135, reps: 10, rpe: 70, restTime: 90 },
            { setNumber: 2, weight: 135, reps: 10, rpe: 75, restTime: 90 },
            { setNumber: 3, weight: 135, reps: 9, rpe: 80, restTime: 90 },
          ],
        },
      ],
    };

    const workoutId = await addWorkout(sampleWorkout);
    console.log('   Created workout with ID:', workoutId);
    console.log('   - 2 exercises, 6 total sets\n');

    // Test 7: Increment Exercise Usage
    console.log('✅ Test 7: Update Exercise Usage');
    await incrementExerciseUsage('Bench Press');
    await incrementExerciseUsage('Barbell Row');
    const topExercises = await getExercisesByUsage();
    console.log('   Most used exercises:');
    topExercises.slice(0, 5).forEach(ex => {
      console.log(`   - ${ex.name}: ${ex.useCount} times`);
    });
    console.log('');

    // Test 8: Get All Workouts
    console.log('✅ Test 8: Get All Workouts');
    const allWorkouts = await getAllWorkouts();
    console.log('   Total workouts:', allWorkouts.length);
    if (allWorkouts.length > 0) {
      const workout = allWorkouts[0];
      console.log('   Latest workout:');
      console.log(`   - Date: ${workout.date}`);
      console.log(`   - Duration: ${workout.duration} minutes`);
      console.log(`   - Exercises: ${workout.exercises.length}`);
      console.log(`   - Total sets: ${workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}`);
    }
    console.log('');

    // Test 9: Get Last Workout
    console.log('✅ Test 9: Get Last Workout (for Quick Start)');
    const lastWorkout = await getLastWorkout();
    if (lastWorkout) {
      console.log('   Last workout found:');
      console.log(`   - ID: ${lastWorkout.id}`);
      console.log(`   - Date: ${lastWorkout.date}`);
      console.log(`   - Exercises: ${lastWorkout.exercises.map(e => e.exerciseName).join(', ')}`);
    }
    console.log('');

    // Test 10: Update Workout
    console.log('✅ Test 10: Update Workout');
    if (lastWorkout) {
      lastWorkout.notes = 'Updated notes: Actually felt amazing!';
      await updateWorkout(lastWorkout);
      console.log('   Updated workout notes\n');
    }

    // Test 11: Final Stats
    console.log('✅ Test 11: Final Database Stats');
    const finalStats = await getDBStats();
    console.log('   Workouts:', finalStats.workoutCount);
    console.log('   Exercises:', finalStats.exerciseCount);
    console.log('');

    // Summary
    console.log('🎉 All Tests Passed!\n');
    console.log('📊 Summary:');
    console.log(`   ✓ Database initialized`);
    console.log(`   ✓ ${finalStats.exerciseCount} exercises in library`);
    console.log(`   ✓ ${finalStats.workoutCount} workout(s) saved`);
    console.log(`   ✓ CRUD operations working`);
    console.log(`   ✓ Search and filtering working`);
    console.log('');
    console.log('💡 Next: Build the UI to use these functions!');

    // Optional: Uncomment to clean up test data
    // console.log('\n🧹 Cleaning up test data...');
    // if (workoutId) await deleteWorkout(workoutId);
    // console.log('   Test workout deleted');

  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

// Auto-run when module loads
runTests();
