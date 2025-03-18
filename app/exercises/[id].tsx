import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Dumbbell } from 'lucide-react-native';
import { exercises } from '../../data/data';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const exercise = exercises.find(e => e.id === id);

  if (!exercise) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Image source={{ uri: exercise.imageUrl }} style={styles.coverImage} />
      <View style={[styles.overlay, { backgroundColor: colors.exerciseOverlay }]} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>
      
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{exercise.title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelText}>{exercise.level}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>{exercise.description}</Text>

        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Dumbbell size={24} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Difficulty</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{exercise.difficulty}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {exercise.muscleGroups.map((group, index) => (
              <View key={index} style={[styles.muscleGroupBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.muscleGroupText}>{group}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Steps</Text>
          {exercise.steps.map((step, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.listNumber, { backgroundColor: colors.primary }]}>{index + 1}</Text>
              <Text style={[styles.listText, { color: colors.text }]}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 300,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleGroupBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  muscleGroupText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
});