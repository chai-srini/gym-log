import { getAllWorkouts } from '../db';
import type { Workout } from '../types';

/**
 * Main entry point for exporting all workouts to CSV
 */
export async function exportWorkoutsToCSV(): Promise<void> {
  const workouts = await getAllWorkouts();

  if (workouts.length === 0) {
    alert('No workouts to export');
    return;
  }

  const csvContent = workoutsToCSVString(workouts);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `gym-workouts-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
}

/**
 * Convert workouts array to CSV string format
 * One row per set with columns: Workout Name, Date, Exercise, Set, Weight, Reps, RPE, Rest, Notes
 */
function workoutsToCSVString(workouts: Workout[]): string {
  const headers = ['Workout Name', 'Date', 'Exercise', 'Set', 'Weight', 'Reps', 'RPE', 'Rest', 'Notes'];
  const rows: string[] = [headers.join(',')];

  for (const workout of workouts) {
    const workoutName = workout.name || '';
    const date = workout.date;
    const workoutNotes = workout.notes || '';

    for (const exercise of workout.exercises) {
      const exerciseName = exercise.exerciseName;
      const exerciseNotes = exercise.notes || '';

      // Combine workout and exercise notes
      const combinedNotes = [workoutNotes, exerciseNotes]
        .filter(n => n.length > 0)
        .join(' | ');

      for (let i = 0; i < exercise.sets.length; i++) {
        const set = exercise.sets[i];
        const row = [
          escapeCsvField(workoutName),
          escapeCsvField(date),
          escapeCsvField(exerciseName),
          escapeCsvField(i + 1),
          escapeCsvField(set.weight ?? ''),
          escapeCsvField(set.reps ?? ''),
          escapeCsvField(set.rpe ?? ''),
          escapeCsvField(set.restTime ?? ''),
          escapeCsvField(combinedNotes),
        ];
        rows.push(row.join(','));
      }
    }
  }

  return rows.join('\n');
}

/**
 * Escape CSV field according to RFC 4180 rules
 * - Quote fields containing comma, quote, newline, or leading/trailing whitespace
 * - Escape internal quotes by doubling them
 */
function escapeCsvField(field: string | number): string {
  const strField = String(field);

  // Check if field needs quoting
  const needsQuoting =
    strField.includes(',') ||
    strField.includes('"') ||
    strField.includes('\n') ||
    strField.includes('\r') ||
    strField !== strField.trim();

  if (!needsQuoting) {
    return strField;
  }

  // Escape quotes by doubling them and wrap in quotes
  return `"${strField.replace(/"/g, '""')}"`;
}

/**
 * Trigger browser download of CSV content
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
