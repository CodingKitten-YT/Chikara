import exercisesData from './exercises.json';
import workoutsData from './workouts.json';

export interface Exercise {
  id: string;
  title: string;
  level: string;
  imageUrl: string;
  description: string;
  muscleGroups: string[];
  steps: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps?: string;
  duration?: string;
  rest: string;
}

export interface WorkoutLevel {
  id: string;
  level: string;
  exercises: WorkoutExercise[];
  warmup: string[];
  stretching: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Workout {
  id: string;
  title: string;
  muscleGroup: string;
  imageUrl: string;
  description: string;
  levels: WorkoutLevel[];
}

interface Category {
  id: string;
  label: string;
}

// Muscle group categories
export const muscleGroups = [
  { id: 'all', label: 'All' },
  { id: 'core', label: 'Core' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'arms', label: 'Arms' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'legs', label: 'Legs' },
  { id: 'full-body', label: 'Full Body' },
];

// Import exercises and workouts from JSON files
export const exercises: Exercise[] = exercisesData as Exercise[];
export const workouts: Workout[] = workoutsData.workouts as Workout[];

// Helper function to filter exercises by search term
export const searchExercises = (searchTerm: string): Exercise[] => {
  if (!searchTerm) return exercises;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return exercises.filter(exercise => 
    exercise.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    exercise.description.toLowerCase().includes(lowerCaseSearchTerm) ||
    exercise.muscleGroups.some(group => group.toLowerCase().includes(lowerCaseSearchTerm)) ||
    exercise.level.toLowerCase().includes(lowerCaseSearchTerm)
  );
};

// Helper function to search workouts
export const searchWorkouts = (searchTerm: string): Workout[] => {
  if (!searchTerm) return workouts;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return workouts.filter(workout => 
    workout.title.toLowerCase().includes(lowerCaseSearchTerm) ||
    workout.description.toLowerCase().includes(lowerCaseSearchTerm) ||
    workout.muscleGroup.toLowerCase().includes(lowerCaseSearchTerm)
  );
};

// Helper function to filter workouts by muscle group
export const filterWorkoutsByMuscleGroup = (muscleGroup: string): Workout[] => {
  if (muscleGroup === 'all') return workouts;
  return workouts.filter(workout => workout.muscleGroup === muscleGroup);
};