import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import ExerciseCard from '../../components/ExerciseCard';
import WorkoutCard from '../../components/WorkoutCard';
import { searchExercises, filterExercisesByCategory, categories, Exercise, searchWorkouts, filterWorkoutsByCategory, Workout } from '../../data/data';

export default function SearchScreen() {
  const router = useRouter(); // Initialize the router
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter exercises based on search query and selected category
  const filteredExercises = React.useMemo(() => {
    const searchResults = searchExercises(searchQuery);
    return filterExercisesByCategory(selectedCategory).filter(exercise =>
      searchResults.some(searchResult => searchResult.id === exercise.id)
    );
  }, [searchQuery, selectedCategory]);

  // Filter workouts based on search query and selected category
  const filteredWorkouts = React.useMemo(() => {
    const searchResults = searchWorkouts(searchQuery);
    return filterWorkoutsByCategory(selectedCategory).filter(workout =>
      searchResults.some(searchResult => searchResult.id === workout.id)
    );
  }, [searchQuery, selectedCategory]);

  // Clear the search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Render each exercise item with navigation
  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <ExerciseCard
      title={item.title}
      level={item.level}
      imageUrl={item.imageUrl}
      onPress={() => router.push(`/workouts/${item.id}`)} // Navigate to detail page
    />
  ), [router]); // Add router as a dependency

  // Render each workout item with navigation
  const renderWorkoutItem = useCallback(({ item }: { item: Workout }) => (
    <WorkoutCard
      title={item.title}
      level={item.levels.length}
      imageUrl={item.imageUrl}
      onPress={() => router.push(`/workouts/${item.id}`)} // Navigate to detail page
    />
  ), [router]); // Add router as a dependency

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find exercises, skills, and workouts</Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
        />

        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <CategoryPill
                label={item.label}
                isSelected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            )}
            keyExtractor={item => item.id}
          />
        </View>

        {/* Exercise List */}
        {filteredExercises.length > 0 ? (
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.exercisesList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        )}

        {/* Workout List */}
        {filteredWorkouts.length > 0 ? (
          <FlatList
            data={filteredWorkouts}
            renderItem={renderWorkoutItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.exercisesList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#718096',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  exercisesList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#718096',
    textAlign: 'center',
  },
});
