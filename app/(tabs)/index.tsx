import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ExerciseCard from '../../components/ExerciseCard';
import SectionHeader from '../../components/SectionHeader';
import { exercises} from '../../data/data';

export default function HomeScreen() {
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
          {/* Recommended Exercises */}
          <SectionHeader 
            title="Recommended For You" 
            onSeeAll={() => router.push('/search')} 
          />
          
          <FlatList
            data={exercises.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ExerciseCard
                  title={item.title}
                  level={item.level}
                  imageUrl={item.imageUrl}
                  onPress={() => router.push(`/workouts/${item.id}`)}
                  compact={true}
                />
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.horizontalList}
          />

          {/* Popular Exercises */}
          <SectionHeader 
            title="Workouts" 
            onSeeAll={() => router.push('/search')} 
          />
          
          {exercises.slice(3, 6).map((exercise, index) => (
            <View key={exercise.id} style={[
              styles.verticalCardWrapper,
              index === 0 && { marginTop: 8 }
            ]}>
              <ExerciseCard
                title={exercise.title}
                level={exercise.level}
                imageUrl={exercise.imageUrl}
                onPress={() => router.push(`/workouts/${exercise.id}`)}
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
  cardWrapper: {
    marginRight: 6,
    marginVertical: 8,
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