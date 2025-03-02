import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Box breathing pattern: 4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds hold
const BREATH_DURATION = 4000; // 4 seconds per phase
const VERSE_DISPLAY_TIME = 15000; // 15 seconds minimum per verse

const verses = [
  {
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    reference: "John 14:27",
    color: "#a2d2ff" // Cool blue
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
    color: "#bde0fe" // Light blue
  },
  {
    text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3",
    color: "#cdb4db" // Soft purple
  }
];

export default function EmergencyResponseScreen() {
  const router = useRouter();
  const [section, setSection] = useState('breathing'); // 'breathing' or 'verses'
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale', 'hold1', 'exhale', 'hold2'
  const [breathCount, setBreathCount] = useState(0);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verseTimer, setVerseTimer] = useState(VERSE_DISPLAY_TIME / 1000);
  const [canProceed, setCanProceed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  
  // Track total time spent in the emergency response
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Breathing animation sequence
  useEffect(() => {
    if (section !== 'breathing') return;
    
    let animation;
    
    if (breathPhase === 'inhale') {
      // Inhale - expand circle
      animation = Animated.timing(breathAnimation, {
        toValue: 1,
        duration: BREATH_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      });
      
      // Change background color to cool blue
      Animated.timing(backgroundColorAnim, {
        toValue: 0,
        duration: BREATH_DURATION,
        useNativeDriver: false,
      }).start();
    } 
    else if (breathPhase === 'hold1' || breathPhase === 'hold2') {
      // Hold - maintain circle size
      animation = Animated.timing(breathAnimation, {
        toValue: breathPhase === 'hold1' ? 1 : 0,
        duration: BREATH_DURATION,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      
      // For hold1, keep cool blue; for hold2, keep warm color
      Animated.timing(backgroundColorAnim, {
        toValue: breathPhase === 'hold1' ? 0 : 1,
        duration: BREATH_DURATION,
        useNativeDriver: false,
      }).start();
    } 
    else if (breathPhase === 'exhale') {
      // Exhale - contract circle
      animation = Animated.timing(breathAnimation, {
        toValue: 0,
        duration: BREATH_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      });
      
      // Change background color to warm tone
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: BREATH_DURATION,
        useNativeDriver: false,
      }).start();
    }
    
    animation.start(({ finished }) => {
      if (finished) {
        // Cycle through breath phases
        if (breathPhase === 'inhale') {
          setBreathPhase('hold1');
        } else if (breathPhase === 'hold1') {
          setBreathPhase('exhale');
        } else if (breathPhase === 'exhale') {
          setBreathPhase('hold2');
        } else if (breathPhase === 'hold2') {
          setBreathPhase('inhale');
          setBreathCount(prev => {
            const newCount = prev + 1;
            // After 3 complete breath cycles, allow proceeding to verses
            if (newCount >= 3) {
              setCanProceed(true);
            }
            return newCount;
          });
        }
      }
    });
    
    return () => {
      animation.stop();
    };
  }, [breathPhase, section]);
  
  // Verse timer
  useEffect(() => {
    if (section !== 'verses' || canProceed) return;
    
    const timer = setInterval(() => {
      setVerseTimer(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setCanProceed(true);
          clearInterval(timer);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [section, canProceed]);
  
  const handleContinue = () => {
    if (section === 'breathing' && canProceed) {
      // Transition to verses section
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setSection('verses');
        setCanProceed(false);
        setVerseTimer(VERSE_DISPLAY_TIME / 1000);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
      
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } 
    else if (section === 'verses' && canProceed) {
      if (currentVerseIndex < verses.length - 1) {
        // Move to next verse
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setCurrentVerseIndex(prev => prev + 1);
          setCanProceed(false);
          setVerseTimer(VERSE_DISPLAY_TIME / 1000);
          
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
        
        // Trigger haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // All verses completed
        setCompleted(true);
      }
    }
  };
  
  const handleReturn = () => {
    // Only allow return if minimum time has passed (2 minutes)
    if (totalTimeSpent >= 120 || completed) {
      router.back();
    } else {
      // Trigger haptic feedback to indicate cannot leave yet
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };
  
  const getBreathInstructions = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe in...';
      case 'hold1':
        return 'Hold...';
      case 'exhale':
        return 'Breathe out...';
      case 'hold2':
        return 'Hold...';
      default:
        return '';
    }
  };
  
  // Interpolate circle size based on breath animation
  const circleSize = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.4, width * 0.7], // 40% to 70% of screen width
  });
  
  // Interpolate background color based on breath phase
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e6f2ff', '#fff1e6'], // Cool blue to warm cream
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View 
        style={[
          styles.backgroundContainer, 
          { backgroundColor: section === 'breathing' ? backgroundColor : '#f7eed2' }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleReturn}
            style={styles.backButton}
            disabled={!completed && totalTimeSpent < 120}
          >
            <ArrowLeft size={24} color={totalTimeSpent >= 120 || completed ? "#d9b64e" : "#d9b64e80"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {section === 'breathing' ? 'Breathing Exercise' : 'Scripture Comfort'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, section === 'breathing' ? styles.activeStep : styles.completedStep]}>
            <View style={styles.stepCircle}>
              {section === 'breathing' ? (
                <Text style={styles.stepNumber}>1</Text>
              ) : (
                <Check size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.stepText}>Breathing</Text>
          </View>
          
          <View style={styles.progressLine} />
          
          <View style={[styles.progressStep, section === 'verses' ? styles.activeStep : {}]}>
            <View style={[styles.stepCircle, section === 'verses' ? styles.activeStepCircle : {}]}>
              <Text style={[styles.stepNumber, section === 'verses' ? styles.activeStepNumber : {}]}>2</Text>
            </View>
            <Text style={[styles.stepText, section === 'verses' ? styles.activeStepText : {}]}>Scripture</Text>
          </View>
        </View>
        
        {section === 'breathing' && (
          <Animated.View style={[styles.breathingContainer, { opacity: fadeAnim }]}>
            <Text style={styles.instructionTitle}>Take a moment to breathe</Text>
            <Text style={styles.instructionSubtitle}>Follow the circle and focus on your breathing</Text>
            
            <View style={styles.breathingCircleContainer}>
              <Animated.View 
                style={[
                  styles.breathingCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: Animated.divide(circleSize, new Animated.Value(2)),
                  }
                ]}
              />
              <Text style={styles.breathInstructions}>{getBreathInstructions()}</Text>
              <Text style={styles.breathCount}>Breath {breathCount + 1} of 3</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.continueButton, { opacity: canProceed ? 1 : 0.5 }]}
              onPress={handleContinue}
              disabled={!canProceed}
            >
              <Text style={styles.continueButtonText}>Continue to Scripture</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {section === 'verses' && (
          <Animated.View style={[styles.versesContainer, { opacity: fadeAnim }]}>
            <Text style={styles.instructionTitle}>Meditate on God's Word</Text>
            <Text style={styles.instructionSubtitle}>
              Take time to read and reflect on this passage
            </Text>
            
            <View style={[styles.verseCard, { backgroundColor: verses[currentVerseIndex].color + '30' }]}>
              <Text style={styles.verseText}>{verses[currentVerseIndex].text}</Text>
              <Text style={styles.verseReference}>{verses[currentVerseIndex].reference}</Text>
            </View>
            
            {!canProceed && (
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  Please spend {verseTimer} more seconds with this verse
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.continueButton, { opacity: canProceed ? 1 : 0.5 }]}
              onPress={handleContinue}
              disabled={!canProceed}
            >
              <Text style={styles.continueButtonText}>
                {currentVerseIndex < verses.length - 1 ? 'Next Verse' : 'Complete Exercise'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {completed && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>Exercise Completed</Text>
            <Text style={styles.completedText}>
              Remember that God is with you in every moment. Take what you've learned here into your day.
            </Text>
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={handleReturn}
            >
              <Text style={styles.returnButtonText}>Return to App</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!completed && totalTimeSpent < 120 && (
          <Text style={styles.timeRemainingText}>
            Please remain in this exercise for at least {Math.ceil((120 - totalTimeSpent) / 60)} more {Math.ceil((120 - totalTimeSpent) / 60) === 1 ? 'minute' : 'minutes'}
          </Text>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#d9b64e',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressStep: {
    alignItems: 'center',
    width: 80,
  },
  progressLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    width: 60,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#d9b64e',
  },
  completedStep: {
    opacity: 0.8,
  },
  activeStep: {
    opacity: 1,
  },
  stepNumber: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 14,
    color: '#5c5436',
  },
  activeStepNumber: {
    color: '#ffffff',
  },
  stepText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 14,
    color: '#5c5436',
  },
  activeStepText: {
    fontWeight: 'bold',
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  instructionTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 22,
    color: '#5c5436',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
    textAlign: 'center',
    marginBottom: 40,
  },
  breathingCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  breathingCircle: {
    backgroundColor: '#d9b64e50',
    borderWidth: 2,
    borderColor: '#d9b64e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathInstructions: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#5c5436',
    position: 'absolute',
  },
  breathCount: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
    position: 'absolute',
    bottom: 0,
  },
  continueButton: {
    backgroundColor: '#d9b64e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
  },
  versesContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  verseCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verseText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 22,
    lineHeight: 32,
    color: '#5c5436',
    marginBottom: 16,
    textAlign: 'center',
  },
  verseReference: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  timerContainer: {
    backgroundColor: '#fce59f50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  timerText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 14,
    color: '#a89a5b',
    textAlign: 'center',
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  completedTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#5c5436',
    marginBottom: 16,
    textAlign: 'center',
  },
  completedText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 18,
    color: '#a89a5b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  returnButton: {
    backgroundColor: '#d9b64e',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  returnButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
  },
  timeRemainingText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 14,
    color: '#a89a5b',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});