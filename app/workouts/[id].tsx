import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, ChevronLeft, Dumbbell } from 'lucide-react-native';
import { workouts, getExerciseById } from '../../data/data';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const workout = workouts.find(w => w.id === id);
  const [selectedLevel, setSelectedLevel] = useState(0);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Workout not found</Text>
      </View>
    );
  }

  const currentLevel = workout.levels[selectedLevel];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Image source={{ uri: workout.imageUrl }} style={styles.coverImage} />
      <View style={[styles.overlay, { backgroundColor: colors.exerciseOverlay }]} />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>
      
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{workout.title}</Text>
          <View style={[styles.muscleGroupBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.muscleGroupText}>{workout.muscleGroup}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>{workout.description}</Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.levelSelector}
        >
          {workout.levels.map((level, index) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelButton,
                { backgroundColor: colors.searchBackground, borderColor: colors.border },
                selectedLevel === index && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedLevel(index)}
            >
              <Text style={[
                styles.levelButtonText,
                { color: colors.text },
                selectedLevel === index && { color: '#FFFFFF' }
              ]}>
                {level.level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Clock size={24} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{currentLevel.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Dumbbell size={24} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Difficulty</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{currentLevel.difficulty}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Warm-up</Text>
          {currentLevel.warmup.map((item, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.listNumber, { backgroundColor: colors.primary }]}>{index + 1}</Text>
              <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercises</Text>
          {currentLevel.exercises.map((exercise, index) => {
            const exerciseDetails = getExerciseById(exercise.exerciseId);
            if (!exerciseDetails) return null;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.exerciseItem, { backgroundColor: colors.surface }]}
                onPress={() => router.push(`/exercises/${exercise.exerciseId}`)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseHeader}>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>{exerciseDetails.title}</Text>
                  <Text style={[styles.exerciseLevel, { color: colors.primary, backgroundColor: `${colors.primary}20` }]}>
                    {exerciseDetails.level}
                  </Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={[styles.exerciseDetail, { color: colors.text, backgroundColor: colors.searchBackground }]}>
                    Sets: {exercise.sets}
                  </Text>
                  {exercise.reps && (
                    <Text style={[styles.exerciseDetail, { color: colors.text, backgroundColor: colors.searchBackground }]}>
                      Reps: {exercise.reps}
                    </Text>
                  )}
                  {exercise.duration && (
                    <Text style={[styles.exerciseDetail, { color: colors.text, backgroundColor: colors.searchBackground }]}>
                      Hold: {exercise.duration}
                    </Text>
                  )}
                  <Text style={[styles.exerciseDetail, { color: colors.text, backgroundColor: colors.searchBackground }]}>
                    Rest: {exercise.rest}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cool-down Stretching</Text>
          {currentLevel.stretching.map((item, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.listNumber, { backgroundColor: colors.primary }]}>{index + 1}</Text>
              <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={() => {/* TODO: Implement workout start */}}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
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
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  levelSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  levelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
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
  exerciseItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  exerciseLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
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