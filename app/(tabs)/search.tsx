import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import CategoryPill from '../../components/CategoryPill';
import ExerciseCard from '../../components/ExerciseCard';
import { exercises, workouts, muscleGroups } from '../../data/data';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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

interface FilterOptions {
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  resultType: 'all' | 'exercise' | 'workout';
}

export default function SearchScreen() {
  const router = useRouter();
  const { muscleGroup: initialMuscleGroup } = useLocalSearchParams<{ muscleGroup?: string }>();
  const { colors, theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    difficulty: 'all',
    resultType: 'all'
  });

  useEffect(() => {
    if (initialMuscleGroup) {
      setSelectedCategory(initialMuscleGroup);
    }
  }, [initialMuscleGroup]);

  const filteredExercises = useMemo(() => {
    if (filters.resultType === 'workout') return [];
    
    return exercises.filter(exercise => {
      const matchesSearch = !searchQuery || 
        exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMuscleGroup = selectedCategory === 'all' || 
        exercise.muscleGroups.includes(selectedCategory);
      
      const matchesDifficulty = filters.difficulty === 'all' || 
        exercise.difficulty === filters.difficulty;
      
      return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    }).map(exercise => ({
      ...exercise,
      type: 'exercise' as const,
      level: exercise.difficulty
    }));
  }, [searchQuery, selectedCategory, filters]);

  const filteredWorkouts = useMemo(() => {
    if (filters.resultType === 'exercise') return [];
    
    return workouts.filter(workout => {
      const matchesSearch = !searchQuery || 
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMuscleGroup = selectedCategory === 'all' || 
        workout.muscleGroup === selectedCategory;
      
      const matchesDifficulty = filters.difficulty === 'all' || 
        workout.levels.some(level => level.difficulty === filters.difficulty);
      
      return matchesSearch && matchesMuscleGroup && matchesDifficulty;
    }).map(workout => ({
      ...workout,
      type: 'workout' as const,
      level: workout.levels[0].difficulty,
      muscleGroup: workout.muscleGroup,
      difficulty: workout.levels[0].difficulty
    }));
  }, [searchQuery, selectedCategory, filters]);

  const searchResults: SearchResult[] = useMemo(() => {
    const combined = [...filteredWorkouts, ...filteredExercises];
    
    if (searchQuery) {
      return combined.sort((a, b) => {
        const aExactMatch = a.title.toLowerCase() === searchQuery.toLowerCase();
        const bExactMatch = b.title.toLowerCase() === searchQuery.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        const aStartsWith = a.title.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsWith = b.title.toLowerCase().startsWith(searchQuery.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.title.localeCompare(b.title);
      });
    } else {
      return combined.sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [filteredWorkouts, filteredExercises, searchQuery]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    if (initialMuscleGroup) {
      router.setParams({});
    }
  }, [initialMuscleGroup, router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const applyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      difficulty: 'all',
      resultType: 'all'
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.difficulty !== 'all') count++;
    if (filters.resultType !== 'all') count++;
    return count;
  }, [filters]);

  const renderFilterModal = () => {
    if (!showFilterModal) return null;
    
    return (
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.filterModal, { backgroundColor: colors.surface }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filter Results</Text>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.searchBackground }]} 
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map(difficulty => (
                <TouchableOpacity 
                  key={difficulty} 
                  style={[
                    styles.filterOption,
                    { backgroundColor: colors.searchBackground, borderColor: colors.border },
                    filters.difficulty === difficulty && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setFilters({...filters, difficulty: difficulty as any})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: colors.text },
                    filters.difficulty === difficulty && { color: '#FFFFFF' }
                  ]}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Type</Text>
            <View style={styles.filterOptions}>
              {['all', 'exercise', 'workout'].map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.filterOption,
                    { backgroundColor: colors.searchBackground, borderColor: colors.border },
                    filters.resultType === type && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setFilters({...filters, resultType: type as any})}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: colors.text },
                    filters.resultType === type && { color: '#FFFFFF' }
                  ]}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={[styles.resetButton, { borderColor: colors.border }]} 
              onPress={resetFilters}
            >
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: colors.primary }]} 
              onPress={() => applyFilters(filters)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find exercises and workouts</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={handleClearSearch}
              placeholder="Search exercises & workouts..."
            />
          </View>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeFilterCount > 0 && { backgroundColor: colors.primary }
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons 
              name="filter" 
              size={22} 
              color={activeFilterCount > 0 ? "#FFFFFF" : colors.text} 
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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

        {searchResults.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
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
                <Text style={[styles.clearFilters, { color: colors.primary }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
            <Ionicons name="search-outline" size={64} color={colors.border} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {searchQuery ? 
                `No matches for "${searchQuery}"` : 
                'Try a different category or filter'}
            </Text>
            {(searchQuery || selectedCategory !== 'all' || filters.difficulty !== 'all' || filters.resultType !== 'all') && (
              <TouchableOpacity 
                style={[styles.resetSearchButton, { backgroundColor: colors.primary }]}
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

      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
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
    borderRadius: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
  },
  clearFilters: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  resetSearchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
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
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  filterModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
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
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDivider: {
    height: 1,
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  filterOptionText: {
    fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  resetButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
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