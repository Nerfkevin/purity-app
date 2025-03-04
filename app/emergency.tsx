import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBibleDatabase, Scripture, EmergencyCategory } from '../lib/hooks/useBibleDatabase';

// Import our new common components
import Header from './components/common/Header';
import ProgressStepper from './components/common/ProgressStepper';
import BreathingExercise from './components/common/BreathingExercise';
import ScriptureCard from './components/common/ScriptureCard';
import ActionButton from './components/common/ActionButton';

export default function EmergencyScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [verseRead, setVerseRead] = useState(false);
  const [emergencyScripture, setEmergencyScripture] = useState<Scripture | null>(null);
  const [loading, setLoading] = useState(true);
  const [breathCount, setBreathCount] = useState(0);
  const [category] = useState<EmergencyCategory>(EmergencyCategory.TEMPTATION);
  
  // Get the database services
  const { getEmergencyScripture, isInitialized } = useBibleDatabase();
  
  const steps = [
    { id: 'breathe', title: 'Breathe' },
    { id: 'scripture', title: 'Scripture' },
    { id: 'prayer', title: 'Prayer' },
  ];
  
  // Load emergency scripture when database is initialized
  useEffect(() => {
    if (isInitialized) {
      loadScripture();
    }
  }, [isInitialized]);
  
  const loadScripture = async () => {
    setLoading(true);
    try {
      const scripture = await getEmergencyScripture(category);
      setEmergencyScripture(scripture);
    } catch (error) {
      console.error('Error loading emergency scripture:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Timer for scripture reading
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (currentStep === 1 && timerSeconds > 0 && !verseRead) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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
  
  const handleBreathComplete = () => {
    setBreathCount(prev => prev + 1);
  };
  
  const handleMaxBreathsReached = () => {
    Alert.alert(
      "Well Done",
      "You've completed the breathing exercise. Ready to move to the next step?",
      [
        { text: "Continue Breathing", style: "cancel" },
        { text: "Next Step", onPress: handleNext }
      ]
    );
  };
  
  const handleShareVerse = async () => {
    if (!emergencyScripture) return;
    
    const reference = `${emergencyScripture.book_name} ${emergencyScripture.chapter}:${emergencyScripture.verse}`;
    const shareText = `"${emergencyScripture.text}" - ${reference}\n\nShared from Purity app`;
    
    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Take a moment to breathe</Text>
            <Text style={styles.stepDescription}>
              Deep breathing helps calm your mind and reduce anxiety.
            </Text>
            
            <BreathingExercise 
              onBreathComplete={handleBreathComplete}
              breathDuration={4000}
              showInstructions={true}
              showCount={true}
              maxBreaths={10}
              onMaxBreathsReached={handleMaxBreathsReached}
              boxBreathing={true}
            />
            
            <Text style={styles.breathCount}>{breathCount} breaths completed</Text>
            
            <ActionButton
              label="I'm Ready for Scripture"
              onPress={handleNext}
              variant="primary"
              fullWidth={true}
              style={styles.actionButton}
            />
          </View>
        );
      
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Meditate on this verse</Text>
            
            {emergencyScripture ? (
              <ScriptureCard
                text={emergencyScripture.text}
                reference={`${emergencyScripture.book_name} ${emergencyScripture.chapter}:${emergencyScripture.verse}`}
                bookName={emergencyScripture.book_name}
                chapter={emergencyScripture.chapter}
                verse={emergencyScripture.verse}
                backgroundColor="#f0f7ff"
                onShare={handleShareVerse}
                showActions={true}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <Text>Loading scripture...</Text>
              </View>
            )}
            
            {!verseRead && (
              <Text style={styles.timerText}>
                Take at least {timerSeconds} seconds to read and reflect
              </Text>
            )}
            
            <ActionButton
              label={verseRead || timerSeconds <= 0 ? "Continue to Prayer" : "I've Read This"}
              onPress={() => {
                if (!verseRead && timerSeconds > 0) {
                  setVerseRead(true);
                } else {
                  handleNext();
                }
              }}
              variant="primary"
              fullWidth={true}
              style={styles.actionButton}
              disabled={!emergencyScripture}
            />
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pray</Text>
            <Text style={styles.stepDescription}>
              Take a moment to pray and ask God for strength in this moment of temptation.
            </Text>
            
            <View style={styles.prayerContainer}>
              <Text style={styles.prayerText}>
                "Lord, I need Your strength right now. Help me to resist this temptation and focus on You instead. Thank You for Your grace and forgiveness. Amen."
              </Text>
            </View>
            
            <View style={styles.checklistContainer}>
              <View style={styles.checkItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.checkText}>You've calmed your breathing</Text>
              </View>
              <View style={styles.checkItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.checkText}>You've meditated on scripture</Text>
              </View>
              <View style={styles.checkItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.checkText}>You've prayed for strength</Text>
              </View>
            </View>
            
            <ActionButton
              label="Complete"
              onPress={() => router.back()}
              variant="primary"
              fullWidth={true}
              style={styles.actionButton}
            />
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#f0f7ff', '#ffffff']}
        style={styles.gradient}
      >
        <Header 
          title="Emergency Response" 
          onBackPress={handleBack}
          backButtonColor="#5b9bd5"
        />
        
        <ProgressStepper 
          steps={steps}
          currentStep={currentStep}
          onStepPress={(index) => {
            // Only allow going back, not forward with the stepper
            if (index < currentStep) {
              setCurrentStep(index);
            }
          }}
          allowNavigation={true}
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  stepContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  breathCount: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  actionButton: {
    marginTop: 30,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  timerText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  prayerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5b9bd5',
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    color: '#555',
  },
  checklistContainer: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});