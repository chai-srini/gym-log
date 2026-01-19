/**
 * IndexedDB wrapper for Gym Logger
 * Handles all database operations for workouts and exercises
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Workout, ExerciseLibraryItem, WorkoutTemplate } from './types';
import { STARTER_EXERCISES, STARTER_TEMPLATES } from './types';

// Database schema definition
interface GymLogDB extends DBSchema {
  workouts: {
    key: number;
    value: Workout;
    indexes: { 'date': string; 'startTime': string };
  };
  exercises: {
    key: number;
    value: ExerciseLibraryItem;
    indexes: { 'name': string; 'lastUsed': string };
  };
  templates: {
    key: number;
    value: WorkoutTemplate;
    indexes: { 'name': string; 'lastUsed': string; 'isStarter': boolean };
  };
}

const DB_NAME = 'gym-log';
const DB_VERSION = 3;

let dbInstance: IDBPDatabase<GymLogDB> | null = null;

/**
 * Initialize and open the database
 */
export async function initDB(): Promise<IDBPDatabase<GymLogDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<GymLogDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // Create workouts object store
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        workoutStore.createIndex('date', 'date');
        workoutStore.createIndex('startTime', 'startTime');
      }

      // Create exercises object store
      if (!db.objectStoreNames.contains('exercises')) {
        const exerciseStore = db.createObjectStore('exercises', {
          keyPath: 'id',
          autoIncrement: true,
        });
        exerciseStore.createIndex('name', 'name', { unique: true });
        exerciseStore.createIndex('lastUsed', 'lastUsed');
      }

      // Migrate from version 1 to version 2: Add category field to exercises
      if (oldVersion < 2) {
        const exerciseStore = transaction.objectStore('exercises');
        exerciseStore.getAll().then((exercises) => {
          exercises.forEach((exercise) => {
            // Find category from STARTER_EXERCISES or default to 'Other'
            const starterExercise = STARTER_EXERCISES.find(
              (ex) => ex.name === exercise.name
            );
            (exercise as any).category = starterExercise?.category || 'Other';
            exerciseStore.put(exercise);
          });
        });
      }

      // Migrate from version 2 to version 3: Add templates object store
      if (oldVersion < 3) {
        // Create templates object store
        const templatesStore = db.createObjectStore('templates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        templatesStore.createIndex('name', 'name', { unique: false });
        templatesStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        templatesStore.createIndex('isStarter', 'isStarter', { unique: false });
      }
    },
  });

  // Initialize with starter exercises if empty
  await initializeStarterExercises();

  // Initialize with starter templates if empty
  await initializeStarterTemplates();

  return dbInstance;
}

/**
 * Initialize database with starter exercises
 */
async function initializeStarterExercises(): Promise<void> {
  const db = await initDB();
  const count = await db.count('exercises');

  // Only add starter exercises if the database is empty
  if (count === 0) {
    console.log('Initializing database with starter exercises...');
    const tx = db.transaction('exercises', 'readwrite');
    const store = tx.objectStore('exercises');

    for (const exercise of STARTER_EXERCISES) {
      await store.add({
        name: exercise.name,
        category: exercise.category,
        lastUsed: new Date().toISOString(),
        useCount: 0,
      });
    }

    await tx.done;
    console.log(`Added ${STARTER_EXERCISES.length} starter exercises`);
  }
}

/**
 * Initialize database with starter templates
 */
async function initializeStarterTemplates(): Promise<void> {
  const db = await initDB();
  const count = await db.count('templates');

  // Only add starter templates if the templates store is empty
  if (count === 0) {
    console.log('Initializing database with starter templates...');
    const tx = db.transaction('templates', 'readwrite');
    const store = tx.objectStore('templates');

    const now = new Date().toISOString();
    for (const template of STARTER_TEMPLATES) {
      await store.add({
        ...template,
        isStarter: true,
        useCount: 0,
        lastUsed: now,
        createdAt: now,
      });
    }

    await tx.done;
    console.log(`Added ${STARTER_TEMPLATES.length} starter templates`);
  }
}

// ====================
// WORKOUT OPERATIONS
// ====================

/**
 * Add a new workout to the database
 */
export async function addWorkout(workout: Omit<Workout, 'id'>): Promise<number> {
  const db = await initDB();
  return await db.add('workouts', workout as Workout);
}

/**
 * Get a workout by ID
 */
export async function getWorkout(id: number): Promise<Workout | undefined> {
  const db = await initDB();
  return await db.get('workouts', id);
}

/**
 * Get all workouts, sorted by date (newest first)
 */
export async function getAllWorkouts(): Promise<Workout[]> {
  const db = await initDB();
  const workouts = await db.getAll('workouts');
  return workouts.sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

/**
 * Get recent workouts (limit to N)
 */
export async function getRecentWorkouts(limit: number = 10): Promise<Workout[]> {
  const workouts = await getAllWorkouts();
  return workouts.slice(0, limit);
}

/**
 * Update an existing workout
 */
export async function updateWorkout(workout: Workout): Promise<void> {
  const db = await initDB();
  await db.put('workouts', workout);
}

/**
 * Delete a workout by ID
 */
export async function deleteWorkout(id: number): Promise<void> {
  const db = await initDB();
  await db.delete('workouts', id);
}

/**
 * Get the most recent workout (for quick start feature)
 */
export async function getLastWorkout(): Promise<Workout | undefined> {
  const workouts = await getRecentWorkouts(1);
  return workouts[0];
}

// ====================
// EXERCISE OPERATIONS
// ====================

/**
 * Add a custom exercise to the library
 */
export async function addExercise(name: string, category: string = 'Other'): Promise<number> {
  const db = await initDB();
  const exercise: Omit<ExerciseLibraryItem, 'id'> = {
    name,
    category: category as any,
    lastUsed: new Date().toISOString(),
    useCount: 0,
  };
  return await db.add('exercises', exercise as ExerciseLibraryItem);
}

/**
 * Get all exercises from the library
 */
export async function getAllExercises(): Promise<ExerciseLibraryItem[]> {
  const db = await initDB();
  return await db.getAll('exercises');
}

/**
 * Get exercises sorted by usage (most used first)
 */
export async function getExercisesByUsage(): Promise<ExerciseLibraryItem[]> {
  const exercises = await getAllExercises();
  return exercises.sort((a, b) => b.useCount - a.useCount);
}

/**
 * Search exercises by name
 */
export async function searchExercises(query: string): Promise<ExerciseLibraryItem[]> {
  const exercises = await getAllExercises();
  const lowerQuery = query.toLowerCase();
  return exercises.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Update exercise usage when it's used in a workout
 */
export async function incrementExerciseUsage(exerciseName: string): Promise<void> {
  const db = await initDB();
  const exercises = await db.getAllFromIndex('exercises', 'name', exerciseName);

  if (exercises.length > 0) {
    const exercise = exercises[0];
    exercise.useCount += 1;
    exercise.lastUsed = new Date().toISOString();
    await db.put('exercises', exercise);
  }
}

/**
 * Delete an exercise from the library
 */
export async function deleteExercise(id: number): Promise<void> {
  const db = await initDB();
  await db.delete('exercises', id);
}

// ====================
// UTILITY FUNCTIONS
// ====================

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDB();
  await db.clear('workouts');
  await db.clear('exercises');
  await db.clear('templates');
  // Re-initialize with starter data
  await initializeStarterExercises();
  await initializeStarterTemplates();
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  workoutCount: number;
  exerciseCount: number;
}> {
  const db = await initDB();
  return {
    workoutCount: await db.count('workouts'),
    exerciseCount: await db.count('exercises'),
  };
}

// ====================
// TEMPLATE OPERATIONS
// ====================

/**
 * Add a new template to the database
 */
export async function addTemplate(template: Omit<WorkoutTemplate, 'id'>): Promise<number> {
  const db = await initDB();
  return await db.add('templates', template as WorkoutTemplate);
}

/**
 * Get a template by ID
 */
export async function getTemplate(id: number): Promise<WorkoutTemplate | undefined> {
  const db = await initDB();
  return await db.get('templates', id);
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  const db = await initDB();
  return await db.getAll('templates');
}

/**
 * Get templates sorted by usage (most used first)
 */
export async function getTemplatesByUsage(): Promise<WorkoutTemplate[]> {
  const templates = await getAllTemplates();
  return templates.sort((a, b) => b.useCount - a.useCount);
}

/**
 * Update an existing template
 */
export async function updateTemplate(template: WorkoutTemplate): Promise<void> {
  const db = await initDB();
  await db.put('templates', template);
}

/**
 * Delete a template by ID
 */
export async function deleteTemplate(id: number): Promise<void> {
  const db = await initDB();
  await db.delete('templates', id);
}

/**
 * Increment template usage when it's used to start a workout
 */
export async function incrementTemplateUsage(id: number): Promise<void> {
  const db = await initDB();
  const template = await db.get('templates', id);

  if (template) {
    template.useCount += 1;
    template.lastUsed = new Date().toISOString();
    await db.put('templates', template);
  }
}

/**
 * Create a template from an existing workout
 */
export async function createTemplateFromWorkout(
  workout: Workout,
  name: string,
  description: string
): Promise<number> {
  const template: Omit<WorkoutTemplate, 'id'> = {
    name,
    description,
    exercises: workout.exercises.map((ex) => ex.exerciseName),
    isStarter: false,
    useCount: 0,
    lastUsed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  return await addTemplate(template);
}
