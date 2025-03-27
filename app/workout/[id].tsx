import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { X, Flag, Clock, Star, Play, Pause, CircleStop as StopCircle } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { workouts, getExerciseById, Workout, WorkoutExercise } from '../../data/data';

type WorkoutStep = 'intro' | 'warmup' | 'exercise' | 'rest';

const REST_TIME = 90; // Rest time in seconds

export default function WorkoutScreen() {
  const { colors, theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState<WorkoutStep>('intro');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentWarmup, setCurrentWarmup] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [reps, setReps] = useState(5);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(REST_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const foundWorkout = workouts.find(w => w.id === id);
    if (foundWorkout) {
      setWorkout(foundWorkout);
    } else {
      router.back();
    }
  }, [id]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    if (currentStep === 'rest') {
      setRestTime(REST_TIME);
      restTimerRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current!);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [currentStep]);

  useEffect(() => {
    // Center the current value in the number selector
    if (scrollViewRef.current) {
      const itemWidth = 60; // Width of each number item including margin
      const offset = (reps * itemWidth) - (Dimensions.get('window').width / 2) + (itemWidth / 2);
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [reps]);

  if (!workout) return null;

  const currentWorkoutLevel = workout.levels[selectedLevel];
  const exercises = currentWorkoutLevel.exercises;
  const warmupExercises = currentWorkoutLevel.warmup;
  const currentWorkoutExercise = exercises[currentExercise];
  const exercise = currentWorkoutExercise ? getExerciseById(currentWorkoutExercise.exerciseId) : null;
  const isLastExercise = currentExercise === exercises.length - 1;
  const isLastSet = currentSet === currentWorkoutExercise?.sets;
  const isLastWarmup = currentWarmup === warmupExercises.length - 1;
  const isTimeBased = currentWorkoutExercise?.duration !== undefined;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setCurrentStep('warmup');
  };

  const handleSkip = () => {
    setCurrentStep('exercise');
  };

  const handleComplete = () => {
    if (currentStep === 'warmup') {
      if (isLastWarmup) {
        setCurrentStep('exercise');
      } else {
        setCurrentWarmup(prev => prev + 1);
      }
    } else if (currentStep === 'exercise') {
      setIsTimerRunning(false);
      setElapsedTime(0);
      if (isLastSet) {
        if (isLastExercise) {
          router.back();
        } else {
          setCurrentStep('rest');
          setCurrentSet(1);
        }
      } else {
        setCurrentSet(prev => prev + 1);
        setCurrentStep('rest');
      }
    } else if (currentStep === 'rest') {
      if (currentSet === currentWorkoutExercise?.sets) {
        setCurrentExercise(prev => prev + 1);
        setCurrentSet(1);
      }
      setCurrentStep('exercise');
    }
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    router.back();
  };

  const renderNumberSelector = () => (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.numberSelectorContent}
    >
      {Array.from({ length: 301 }, (_, i) => i).map(num => (
        <TouchableOpacity
          key={num}
          style={[
            styles.numberOption,
            reps === num && { backgroundColor: colors.primary }
          ]}
          onPress={() => setReps(num)}
        >
          <Text
            style={[
              styles.numberOptionText,
              { color: reps === num ? '#FFFFFF' : colors.text }
            ]}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderIntro = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Image source={{ uri: workout.imageUrl }} style={styles.backgroundImage} />
      <View style={[styles.overlay, { backgroundColor: colors.exerciseOverlay }]} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{workout.title}</Text>
        <Text style={styles.description}>{workout.description}</Text>

        <View style={styles.infoBox}>
          <Text style={[styles.infoIcon, { color: colors.text }]}>ⓘ</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Attention</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            All exercises and skills are performed on own risk and should include proper and if needed extended warm up!
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderWarmup = () => (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.progress}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Warmup {currentWarmup + 1}/{warmupExercises.length}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: colors.primary, width: `${((currentWarmup + 1) / warmupExercises.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.warmupContent}>
        <Text style={[styles.warmupTitle, { color: colors.text }]}>Warmup Exercise</Text>
        <Text style={[styles.warmupInstruction, { color: colors.text }]}>
          {warmupExercises[currentWarmup]}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>
            {isLastWarmup ? 'Start Workout' : 'Next Exercise'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderExercise = () => {
    if (!exercise) return null;

    const progress = ((currentExercise * currentWorkoutExercise.sets + (currentSet - 1)) / 
      (exercises.reduce((acc, ex) => acc + ex.sets, 0))) * 100;

    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.progress}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              Exercise {currentExercise + 1}/{exercises.length} • Set {currentSet}/{currentWorkoutExercise.sets}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: colors.primary, width: `${progress}%` }
                ]} 
              />
            </View>
          </View>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseContent}>
          <Image
            source={{ uri: exercise.imageUrl }}
            style={styles.exerciseImage}
          />
          <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exercise.title}</Text>
          
          <View style={styles.repsContainer}>
            {isTimeBased ? (
              <>
                <Text style={[styles.repsNumber, { color: colors.text }]}>
                  {formatTime(elapsedTime)}
                </Text>
                <View style={styles.timerControls}>
                  <TouchableOpacity
                    style={[styles.timerButton, { backgroundColor: colors.primary }]}
                    onPress={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? (
                      <Pause size={24} color="#FFFFFF" />
                    ) : (
                      <Play size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timerButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setIsTimerRunning(false);
                      setElapsedTime(0);
                    }}
                  >
                    <StopCircle size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={[styles.repsNumber, { color: colors.text }]}>
                {currentWorkoutExercise.reps}
              </Text>
            )}
            <View style={styles.repsInfo}>
              <View style={styles.repsStat}>
                <Flag size={20} color={colors.primary} />
                <Text style={[styles.repsText, { color: colors.textSecondary }]}>
                  Set {currentSet} of {currentWorkoutExercise.sets}
                </Text>
              </View>
              <View style={styles.repsStat}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.repsText, { color: colors.textSecondary }]}>
                  {currentWorkoutExercise.rest}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>
              {isLastSet && isLastExercise ? 'Finish Workout' : 'Complete Set'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderRest = () => {
    if (!exercise) return null;

    const nextExercise = isLastSet ? 
      (currentExercise < exercises.length - 1 ? getExerciseById(exercises[currentExercise + 1].exerciseId) : null) :
      exercise;

    if (!nextExercise && isLastSet) return null;

    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.nextText, { color: colors.text }]}>Rest</Text>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.restContent}>
          <Text style={[styles.exerciseTitle, { color: colors.text }]}>
            {isLastSet ? 'Next Exercise:' : 'Next Set:'}
          </Text>
          <Text style={[styles.nextExerciseTitle, { color: colors.text }]}>
            {nextExercise.title}
          </Text>
          <Image
            source={{ uri: nextExercise.imageUrl }}
            style={styles.nextExerciseImage}
          />
          
          <View style={styles.restStats}>
            <View style={styles.restStat}>
              <Flag size={20} color={colors.primary} />
              <Text style={[styles.restStatText, { color: colors.textSecondary }]}>
                {isLastSet ? `${exercises[currentExercise + 1].sets}x` : `Set ${currentSet + 1} of ${currentWorkoutExercise.sets}`}
              </Text>
            </View>
            <View style={styles.restStat}>
              <Clock size={20} color={colors.primary} />
              <Text style={[styles.restStatText, { color: colors.textSecondary }]}>
                {currentWorkoutExercise.rest}
              </Text>
            </View>
          </View>

          <View style={styles.timer}>
            <Text style={[styles.timerNumber, { color: colors.text }]}>{restTime}</Text>
            <TouchableOpacity
              style={[styles.skipRestButton, { backgroundColor: colors.surface }]}
              onPress={handleComplete}
            >
              <Text style={[styles.skipRestText, { color: colors.text }]}>SKIP REST</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.question, { color: colors.text }]}>
            {isTimeBased ? 
              `How many seconds of ${exercise.title} could you do?` :
              `How many ${exercise.title}s could you do?`
            }
          </Text>
          {renderNumberSelector()}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'warmup' && renderWarmup()}
      {currentStep === 'exercise' && renderExercise()}
      {currentStep === 'rest' && renderRest()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    minHeight: Dimensions.get('window').height,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  description: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    marginBottom: 48,
    lineHeight: 36,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  progress: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  warmupContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - 200,
  },
  warmupTitle: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  warmupInstruction: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 28,
  },
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  exerciseImage: {
    width: '100%',
    height: 400,
    borderRadius: 24,
    marginBottom: 24,
  },
  exerciseTitle: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  nextExerciseTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  repsContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  repsNumber: {
    fontSize: 64,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repsInfo: {
    flexDirection: 'row',
    gap: 24,
  },
  repsStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  nextText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
  },
  restContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - 200,
  },
  nextExerciseImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 24,
  },
  restStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 48,
  },
  restStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restStatText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  timer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  timerNumber: {
    fontSize: 72,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  skipRestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipRestText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  question: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 24,
  },
  numberSelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  numberOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  numberOptionText: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
});