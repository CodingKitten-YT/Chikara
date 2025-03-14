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

interface Category {
  id: string;
  label: string;
}

interface WorkoutLevel {
  level: number;
  exercises: {
    exerciseId: string;
    reps: string;
  }[];
}

export interface Workout {
  id: string;
  title: string;
  levels: WorkoutLevel[];
}

// Categories
export const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'lower-body', label: 'Lower Body' },
  { id: 'core', label: 'Core' },
  { id: 'full-body', label: 'Full Body' },
];

// Import exercises from JSON file
export const exercises: Exercise[] = exercisesData as Exercise[];

// Import workouts from JSON file
export const workouts: Workout[] = workoutsData as Workout[];

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

// Helper function to filter exercises by category
export const filterExercisesByCategory = (categoryId: string): Exercise[] => {
  if (categoryId === 'all') return exercises;
  
  if (categoryId === 'beginner' || categoryId === 'intermediate' || categoryId === 'advanced') {
    return exercises.filter(exercise => exercise.difficulty === categoryId);
  }
  
  if (categoryId === 'upper-body') {
    return exercises.filter(exercise => 
      exercise.muscleGroups.some(group => 
        ['chest', 'back', 'shoulders', 'triceps', 'biceps', 'forearms'].includes(group)
      )
    );
  }
  
  if (categoryId === 'lower-body') {
    return exercises.filter(exercise => 
      exercise.muscleGroups.some(group => 
        ['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(group)
      )
    );
  }
  
  if (categoryId === 'core') {
    return exercises.filter(exercise => 
      exercise.muscleGroups.includes('core')
    );
  }
  
  if (categoryId === 'full-body') {
    return exercises.filter(exercise => 
      exercise.muscleGroups.some(group => ['chest', 'back', 'shoulders'].includes(group)) &&
      exercise.muscleGroups.some(group => ['quadriceps', 'hamstrings', 'glutes'].includes(group))
    );
  }
  
  return exercises;
};
