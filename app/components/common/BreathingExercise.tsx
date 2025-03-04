import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Configurable constants
const DEFAULT_BREATH_DURATION = 4000; // 4 seconds per phase

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

interface BreathingExerciseProps {
  onBreathComplete?: () => void;
  breathDuration?: number;
  showInstructions?: boolean;
  showCount?: boolean;
  maxBreaths?: number;
  onMaxBreathsReached?: () => void;
  boxBreathing?: boolean; // If true, includes two hold phases (box breathing)
}

export default function BreathingExercise({
  onBreathComplete,
  breathDuration = DEFAULT_BREATH_DURATION,
  showInstructions = true,
  showCount = true,
  maxBreaths,
  onMaxBreathsReached,
  boxBreathing = false,
}: BreathingExerciseProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const breathAnimation = useRef(new Animated.Value(0)).current;

  // Breathing animation sequence
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    
    if (breathPhase === 'inhale') {
      // Inhale - expand circle
      animation = Animated.timing(breathAnimation, {
        toValue: 1,
        duration: breathDuration,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      });
      
      animation.start(() => {
        if (boxBreathing) {
          setBreathPhase('hold');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          setBreathPhase('exhale');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      });
    } else if (breathPhase === 'hold') {
      // First hold phase (after inhale)
      setTimeout(() => {
        setBreathPhase('exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, breathDuration);
    } else if (breathPhase === 'exhale') {
      // Exhale - contract circle
      animation = Animated.timing(breathAnimation, {
        toValue: 0,
        duration: breathDuration,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      });
      
      animation.start(() => {
        if (boxBreathing) {
          setBreathPhase('hold2');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          setBreathPhase('inhale');
          setBreathCount(prev => prev + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          if (onBreathComplete) {
            onBreathComplete();
          }
          
          if (maxBreaths && breathCount + 1 >= maxBreaths && onMaxBreathsReached) {
            onMaxBreathsReached();
          }
        }
      });
    } else if (breathPhase === 'hold2') {
      // Second hold phase (after exhale)
      setTimeout(() => {
        setBreathPhase('inhale');
        setBreathCount(prev => prev + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        if (onBreathComplete) {
          onBreathComplete();
        }
        
        if (maxBreaths && breathCount + 1 >= maxBreaths && onMaxBreathsReached) {
          onMaxBreathsReached();
        }
      }, breathDuration);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [breathPhase, breathCount, breathDuration, boxBreathing, onBreathComplete, maxBreaths, onMaxBreathsReached]);

  const getBreathInstructions = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe in slowly';
      case 'hold':
        return 'Hold your breath';
      case 'exhale':
        return 'Breathe out slowly';
      case 'hold2':
        return 'Hold';
      default:
        return '';
    }
  };

  const circleSize = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.4, width * 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.breathCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: width,
          },
        ]}
      />
      
      {showInstructions && (
        <Text style={styles.instructions}>{getBreathInstructions()}</Text>
      )}
      
      {showCount && (
        <Text style={styles.breathCount}>{breathCount} breaths completed</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathCircle: {
    backgroundColor: 'rgba(160, 205, 250, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(130, 170, 255, 0.8)',
  },
  instructions: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  breathCount: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 