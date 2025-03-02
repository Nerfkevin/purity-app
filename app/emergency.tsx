import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function EmergencyScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [verseRead, setVerseRead] = useState(false);
  const breathAnimation = useRef(new Animated.Value(0)).current;
  
  const steps = [
    { id: 'breathe', title: 'Breathe' },
    { id: 'scripture', title: 'Scripture' },
    { id: 'prayer', title: 'Prayer' },
  ];
  
  // Breathing animation
  useEffect(() => {
    if (currentStep === 0) {
      if (breathPhase === 'inhale') {
        Animated.timing(breathAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }).start(() => {
          setBreathPhase('hold');
          setTimeout(() => {
            setBreathPhase('exhale');
          }, 2000);
        });
      } else if (breathPhase === 'exhale') {
        Animated.timing(breathAnimation, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: false,
        }).start(() => {
          setBreathPhase('inhale');
          setBreathCount(prev => prev + 1);
        });
      }
    }
  }, [breathPhase, currentStep]);
  
  // Timer for scripture reading
  useEffect(() => {
    let interval;
    if (currentStep === 1 && timerSeconds > 0 && !verseRead) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timerSeconds, verseRead]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.back();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };
  
  const handleVerseRead = () => {
    setVerseRead(true);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const circleSize = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 220],
  });
  
  const circleColor = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.8)'],
  });
  
  const getBreathText = () => {
    if (breathPhase === 'inhale') return 'Breathe In';
    if (breathPhase === 'hold') return 'Hold';
    return 'Breathe Out';
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Help</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View 
              style={[
                styles.stepCircle, 
                currentStep === index ? styles.activeStepCircle : 
                currentStep > index ? styles.completedStepCircle : {}
              ]}
            >
              {currentStep > index ? (
                <Check size={16} color="#ffffff" />
              ) : (
                <Text 
                  style={[
                    styles.stepNumber, 
                    currentStep === index ? styles.activeStepNumber : {}
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text 
              style={[
                styles.stepTitle, 
                currentStep === index ? styles.activeStepTitle : {}
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
      
      {currentStep === 0 && (
        <View style={styles.breathingContainer}>
          <Text style={styles.breathingTitle}>Take a moment to breathe</Text>
          <Text style={styles.breathingSubtitle}>Follow the circle and focus on your breathing</Text>
          
          <View style={styles.breathingAnimationContainer}>
            <Animated.View 
              style={[
                styles.breathingCircle,
                {
                  width: circleSize,
                  height: circleSize,
                  backgroundColor: circleColor,
                }
              ]}
            />
            <Text style={styles.breathingPhaseText}>{getBreathText()}</Text>
            <Text style={styles.breathCountText}>Breath {breathCount + 1} of 5</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.nextButton, { opacity: breathCount >= 4 ? 1 : 0.5 }]}
            onPress={handleNext}
            disabled={breathCount < 4}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {currentStep === 1 && (
        <ScrollView style={styles.scriptureContainer} contentContainerStyle={styles.scriptureContent}>
          <Text style={styles.scriptureTitle}>Meditate on God's Word</Text>
          <Text style={styles.scriptureSubtitle}>
            Take time to read and reflect on this passage
          </Text>
          
          <View style={styles.verseContainer}>
            <Text style={styles.verseText}>
              "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it."
            </Text>
            <Text style={styles.verseReference}>1 Corinthians 10:13</Text>
          </View>
          
          <View style={styles.reflectionContainer}>
            <Text style={styles.reflectionTitle}>Reflection</Text>
            <Text style={styles.reflectionText}>
              This verse reminds us that temptation is a universal human experience. You are not alone in your struggles. More importantly, God promises to provide a way of escape from every temptation. Right now, you've already taken the first step by using this emergency feature.
            </Text>
            <Text style={styles.reflectionText}>
              Consider: What is the "way out" that God is providing for you in this moment? How can you take that path instead of giving in to temptation?
            </Text>
          </View>
          
          {!verseRead && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Please spend at least {formatTime(timerSeconds)} with this scripture</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.nextButton, { opacity: verseRead ? 1 : 0.5 }]}
            onPress={handleNext}
            disabled={!verseRead}
          >
            <Text style={styles.nextButtonText}>I've Read This Scripture</Text>
          </TouchableOpacity>
          
          {!verseRead && timerSeconds <= 0 && (
            <TouchableOpacity 
              style={styles.markReadButton}
              onPress={handleVerseRead}
            >
              <Text style={styles.markReadText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
      
      {currentStep === 2 && (
        <View style={styles.prayerContainer}>
          <Text style={styles.prayerTitle}>Let's Pray Together</Text>
          <Text style={styles.prayerSubtitle}>
            Take a moment to pray this prayer or use your own words
          </Text>
          
          <View style={styles.prayerTextContainer}>
            <Text style={styles.prayerText}>
              "Heavenly Father, I come before you in a moment of weakness. Thank you for your faithfulness and for providing a way out of temptation. Strengthen me with your Holy Spirit to resist the enemy's attacks. Create in me a pure heart, O God, and renew a steadfast spirit within me. Help me to fix my eyes on Jesus and to take every thought captive. I surrender this temptation to you and choose the path of purity. In Jesus' name, Amen."
            </Text>
          </View>
          
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.completeButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity 
              style={styles.completeButtonTouch}
              onPress={() => router.back()}
            >
              <Text style={styles.completeButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0f172a',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#3b82f6',
  },
  completedStepCircle: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748b',
  },
  activeStepNumber: {
    color: '#ffffff',
  },
  stepTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
  },
  activeStepTitle: {
    color: '#0f172a',
    fontFamily: 'Inter-SemiBold',
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  breathingTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  breathingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  breathingAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  breathingCircle: {
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingPhaseText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0f172a',
    position: 'absolute',
  },
  breathCountText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    position: 'absolute',
    bottom: 0,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  scriptureContainer: {
    flex: 1,
  },
  scriptureContent: {
    padding: 20,
  },
  scriptureTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  scriptureSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  verseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  verseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 16,
  },
  verseReference: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'right',
  },
  reflectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  reflectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 16,
  },
  reflectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  timerContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  timerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#3b82f6',
  },
  markReadButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  markReadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
  },
  prayerContainer: {
    flex: 1,
    padding: 20,
  },
  prayerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  prayerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  prayerTextContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  prayerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  completeButton: {
    borderRadius: 8,
    marginTop: 'auto',
    overflow: 'hidden',
  },
  completeButtonTouch: {
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  completeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffffff',
  },
});