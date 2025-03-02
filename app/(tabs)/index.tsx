import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.4; // 40% of screen width

export default function EmergencyScreen() {
  const router = useRouter();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  
  // Animation for pulsing effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fillAnim = React.useRef(new Animated.Value(0)).current;
  
  // Setup pulsing animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulse.start();
    
    return () => {
      pulse.stop();
    };
  }, []);
  
  // Handle long press
  useEffect(() => {
    let interval;
    
    if (pressing && !activated) {
      // Start timer to track progress
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.05; // 5% every 100ms = 2 seconds total
          
          // Update fill animation
          fillAnim.setValue(newProgress > 1 ? 1 : newProgress);
          
          // If reached 100%, trigger activation
          if (newProgress >= 1 && !activated) {
            clearInterval(interval);
            triggerEmergency();
            return 1;
          }
          
          return newProgress > 1 ? 1 : newProgress;
        });
      }, 100);
    } else if (!pressing && !activated) {
      // Reset progress when not pressing
      clearInterval(interval);
      setProgress(0);
      fillAnim.setValue(0);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [pressing, activated]);
  
  const triggerEmergency = () => {
    setActivated(true);
    
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Navigate to emergency response screen
    router.push('/emergency-response');
    
    // Reset button state after navigation
    setTimeout(() => {
      setActivated(false);
      setProgress(0);
      fillAnim.setValue(0);
    }, 500);
  };
  
  const handlePressIn = () => {
    setPressing(true);
    
    // Initial haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handlePressOut = () => {
    setPressing(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Emergency</Text>
        <TouchableOpacity style={styles.profileButton}>
          <User size={20} color="#d9b64e" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [{ scale: activated ? 1 : pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.button}
            disabled={activated}
          >
            <Animated.View 
              style={[
                styles.buttonFill,
                {
                  height: fillAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]} 
            />
            <Text style={styles.buttonText}>
              {activated ? 'ACTIVATED' : pressing ? 'HOLD...' : 'EMERGENCY'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {pressing && !activated && (
          <Text style={styles.instructionText}>
            Hold for {Math.ceil(2 * (1 - progress))} seconds to activate
          </Text>
        )}
        
        {activated && (
          <Text style={styles.activatedText}>
            Emergency activated. Help is on the way.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7eed2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#d9b64e',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce59f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#d9b64e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fce59f',
    width: '100%',
  },
  buttonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    zIndex: 1,
  },
  instructionText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    marginTop: 20,
    fontSize: 16,
    color: '#a89a5b',
  },
  activatedText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d9b64e',
  },
});