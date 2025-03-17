import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ExerciseCard from '../../components/ExerciseCard';
import SectionHeader from '../../components/SectionHeader';
import { exercises, workouts, muscleGroups } from '../../data/data';

export default function HomeScreen() {
  const handleMuscleGroupPress = (muscleGroupId: string) => {
    router.push({
      pathname: '/search',
      params: { muscleGroup: muscleGroupId }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back, Name! 👋</Text>
          <Text style={styles.subtitle}>Let's make today count</Text>
        </View>

        {/* Content Container */}
        <View style={styles.content}>
          {/* Muscle Groups Section */}
            <SectionHeader 
              title="Train by Muscle Group" 
              onSeeAll={() => router.push('/search')} 
            />
            
            <FlatList
              data={muscleGroups.filter(group => group.id !== 'all')}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.muscleGroupCard}
                  onPress={() => handleMuscleGroupPress(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.muscleGroupTitle}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.horizontalList}
            />

          {/* Featured Exercises */}
          <SectionHeader 
            title="Featured Exercises" 
            onSeeAll={() => router.push('/search')} 
          />
          
          <FlatList
            data={exercises.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ExerciseCard
                title={item.title}
                level={item.level}
                imageUrl={item.imageUrl}
                onPress={() => router.push(`/exercises/${item.id}`)}
                compact
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.horizontalList}
          />

          {/* Featured Workouts */}
          <SectionHeader 
            title="Featured Workouts" 
            onSeeAll={() => router.push('/search')} 
          />
          
          {workouts.slice(0, 3).map((workout, index) => (
            <View key={workout.id} style={[
              styles.verticalCardWrapper,
              index === 0 && { marginTop: 8 }
            ]}>
              <ExerciseCard
                title={workout.title}
                level={workout.levels[0].difficulty}
                imageUrl={workout.imageUrl}
                onPress={() => router.push(`/workouts/${workout.id}`)}
                tag={workout.muscleGroup}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
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
  greeting: {
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
    paddingHorizontal: 16,
  },
  horizontalList: {
    paddingRight: 24,
  },
  muscleGroupCard: {
    backgroundColor: '#769267',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
    marginVertical: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleGroupTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  verticalCardWrapper: {
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});