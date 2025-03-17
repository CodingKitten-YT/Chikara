import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import ExerciseCard from '../../components/ExerciseCard';
import { exercises, workouts, muscleGroups, Exercise, Workout } from '../../data/data';
import { Ionicons } from '@expo/vector-icons';

// Define the combined search result type
type SearchResult = {
  id: string;
  title: string;
  level: string;
  imageUrl: string;
  type: 'exercise' | 'workout';
  muscleGroup?: string;
  muscleGroups?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

// Define filter options
interface FilterOptions {
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  resultType: 'all' | 'exercise' | 'workout';
}

export default function SearchScreen() {
  const router = useRouter();
  const { muscleGroup: initialMuscleGroup } = useLocalSearchParams<{ muscleGroup?: string }>();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: 'all',
    resultType: 'all'
  });

  // Set the initial muscle group when component mounts or when the param changes
  useEffect(() => {
    if (initialMuscleGroup) {
      setSelectedCategory(initialMuscleGroup);
    }
  }, [initialMuscleGroup]);

  // Filter exercises based on search query, selected category and difficulty
  const filteredExercises = useMemo(() => {
    if (filters.resultType === 'workout') return [];
    
    return exercises.filter(exercise => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by muscle group
      const matchesMuscleGroup = selectedCategory === 'all' || 
        exercise.muscleGroups.includes(selectedCategory);
      
      // Filter by difficulty
      const matchesDifficulty = filters.difficulty === 'all' || 
        exercise.difficulty === filters.difficulty;
      
      return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    }).map(exercise => ({
      ...exercise,
      type: 'exercise' as const,
      level: exercise.difficulty
    }));
  }, [searchQuery, selectedCategory, filters]);

  // Filter workouts based on search query, selected category and difficulty
  const filteredWorkouts = useMemo(() => {
    if (filters.resultType === 'exercise') return [];
    
    return workouts.filter(workout => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by muscle group
      const matchesMuscleGroup = selectedCategory === 'all' || 
        workout.muscleGroup === selectedCategory;
      
      // Filter by difficulty (any level matches the difficulty)
      const matchesDifficulty = filters.difficulty === 'all' || 
        workout.levels.some(level => level.difficulty === filters.difficulty);
      
      return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    }).map(workout => ({
      ...workout,
      type: 'workout' as const,
      level: workout.levels[0].difficulty,
      muscleGroup: workout.muscleGroup
    }));
  }, [searchQuery, selectedCategory, filters]);

  // Combine and sort results
  const searchResults: SearchResult[] = useMemo(() => {
    const combined = [...filteredWorkouts, ...filteredExercises];
    
    // Sort by relevance if searching, otherwise sort alphabetically
    if (searchQuery) {
      return combined.sort((a, b) => {
        // Exact title matches first
        const aExactMatch = a.title.toLowerCase() === searchQuery.toLowerCase();
        const bExactMatch = b.title.toLowerCase() === searchQuery.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Starts with the search term next
        const aStartsWith = a.title.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsWith = b.title.toLowerCase().startsWith(searchQuery.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Alphabetical as fallback
        return a.title.localeCompare(b.title);
      });
    } else {
      // Default sorting is alphabetical
      return combined.sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [filteredWorkouts, filteredExercises, searchQuery]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    // Clear the route param without full navigation
    if (initialMuscleGroup) {
      router.setParams({});
    }
  }, [initialMuscleGroup, router]);

  // Clear the search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      difficulty: 'all',
      resultType: 'all'
    });
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.difficulty !== 'all') count++;
    if (filters.resultType !== 'all') count++;
    return count;
  }, [filters]);

  // Render filter modal/panel
  const renderFilterModal = () => {
    if (!showFilterModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Results</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalDivider} />
          
          {/* Difficulty Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map(difficulty => (
                <TouchableOpacity 
                  key={difficulty} 
                  style={[
                    styles.filterOption,
                    filters.difficulty === difficulty && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({...filters, difficulty: difficulty as any})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.difficulty === difficulty && styles.filterOptionTextSelected
                  ]}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Result Type Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Type</Text>
            <View style={styles.filterOptions}>
              {['all', 'exercise', 'workout'].map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.filterOption,
                    filters.resultType === type && styles.filterOptionSelected
                  ]}
                  onPress={() => setFilters({...filters, resultType: type as any})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.resultType === type && styles.filterOptionTextSelected
                  ]}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => applyFilters(filters)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render each item
  const renderSearchItem = useCallback(({ item }: { item: SearchResult }) => (
    <ExerciseCard
      title={item.title}
      level={item.level}
      imageUrl={item.imageUrl}
      onPress={() => router.push(`/${item.type}s/${item.id}`)}
      tag={item.type === 'workout' ? item.muscleGroup : (item.muscleGroups && item.muscleGroups.length > 0 ? item.muscleGroups[0] : undefined)}
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
        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            style={styles.searchBar}
            placeholder="Search exercises & workouts..."
          />
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={22} color={activeFilterCount > 0 ? "#FFFFFF" : "#1E293B"} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={[{id: 'all', label: 'All Categories'}, ...muscleGroups.filter(group => group.id !== 'all')]}
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
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Results Stats */}
        {searchResults.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              {filters.difficulty !== 'all' && ` • ${filters.difficulty}`}
              {filters.resultType !== 'all' && ` • ${filters.resultType}s`}
            </Text>
            {(filters.difficulty !== 'all' || filters.resultType !== 'all' || selectedCategory !== 'all') && (
              <TouchableOpacity 
                onPress={() => {
                  resetFilters();
                  setSelectedCategory('all');
                  if (initialMuscleGroup) {
                    router.setParams({});
                  }
                }}
              >
                <Text style={styles.clearFilters}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
            <Ionicons name="search-outline" size={64} color="#CAD5C5" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 
                `No matches for "${searchQuery}"` : 
                'Try a different category or filter'}
            </Text>
            {(searchQuery || selectedCategory !== 'all' || filters.difficulty !== 'all' || filters.resultType !== 'all') && (
              <TouchableOpacity 
                style={styles.resetSearchButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  resetFilters();
                  if (initialMuscleGroup) {
                    router.setParams({});
                  }
                }}
              >
                <Text style={styles.resetSearchButtonText}>Reset Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Filter Modal */}
      {renderFilterModal()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#769267',
    borderColor: '#769267',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6C44',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryList: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  clearFilters: {
    fontSize: 14,
    color: '#769267',
    fontWeight: '600',
  },
  resultsList: {
    paddingBottom: 20,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  resetSearchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#769267',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetSearchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterOptionSelected: {
    backgroundColor: '#769267',
    borderColor: '#769267',
  },
  filterOptionText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  resetButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#769267',
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});