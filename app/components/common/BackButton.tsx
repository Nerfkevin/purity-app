import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  label?: string;
  showLabel?: boolean;
}

export default function BackButton({
  onPress,
  color = '#333',
  label = 'Back',
  showLabel = false
}: BackButtonProps) {
  const router = useRouter();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.backButton} 
      onPress={handlePress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <ArrowLeft size={24} color={color} />
      {showLabel && <Text style={[styles.backLabel, { color }]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backLabel: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
}); 