import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import ExerciseCard from '../../components/ExerciseCard';
import { searchExercises, searchWorkouts, filterWorkoutsByMuscleGroup, categories, Exercise, Workout } from '../../data/data';

type SearchResult = {
  id: string;
  title: string;
  level: string;
  imageUrl: string;
  type: 'exercise' | 'workout';
  muscleGroup?: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const { muscleGroup: initialMuscleGroup } = useLocalSearchParams<{ muscleGroup?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialMuscleGroup || 'all');

  // Combine and format search results
  const searchResults = React.useMemo(() => {
    let filteredWorkouts = initialMuscleGroup 
      ? filterWorkoutsByMuscleGroup(initialMuscleGroup)
      : searchWorkouts(searchQuery);

    if (selectedCategory !== 'all' && !initialMuscleGroup) {
      filteredWorkouts = filterWorkoutsByMuscleGroup(selectedCategory);
    }
    
    const workouts = filteredWorkouts.map(workout => ({
      ...workout,
      type: 'workout' as const,
      level: workout.levels[0].difficulty,
      muscleGroup: workout.muscleGroup
    }));

    const exercises = !initialMuscleGroup ? searchExercises(searchQuery).map(exercise => ({
      ...exercise,
      type: 'exercise' as const
    })) : [];

    return [...workouts, ...exercises];
  }, [searchQuery, selectedCategory, initialMuscleGroup]);

  // Clear the search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    if (initialMuscleGroup) {
      // Clear the initial muscle group filter by replacing the current route
      router.replace('/search');
    }
  }, [initialMuscleGroup, router]);

  // Render each item
  const renderSearchItem = useCallback(({ item }: { item: SearchResult }) => (
    <ExerciseCard
      title={item.title}
      level={item.level}
      imageUrl={item.imageUrl}
      onPress={() => router.push(`/${item.type}s/${item.id}`)}
      tag={item.muscleGroup}
    />
  ), [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find exercises and workouts</Text>
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
                onPress={() => handleCategorySelect(item.id)}
              />
            )}
            keyExtractor={item => item.id}
          />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={item => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  resultsList: {
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