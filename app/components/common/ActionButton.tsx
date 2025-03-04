import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, TextStyle, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';

interface ActionButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ActionButton({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ActionButtonProps) {
  
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Provide haptic feedback based on button style
    if (variant === 'primary') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };
  
  // Button style based on variant
  const getButtonStyle = () => {
    const baseStyle: StyleProp<ViewStyle>[] = [styles.button];
    
    // Size variations
    if (size === 'small') baseStyle.push(styles.buttonSmall as ViewStyle);
    if (size === 'large') baseStyle.push(styles.buttonLarge as ViewStyle);
    
    // Width variations
    if (fullWidth) baseStyle.push(styles.buttonFullWidth as ViewStyle);
    
    // Style variations
    if (variant === 'primary') baseStyle.push(styles.buttonPrimary as ViewStyle);
    if (variant === 'secondary') baseStyle.push(styles.buttonSecondary as ViewStyle);
    if (variant === 'outline') baseStyle.push(styles.buttonOutline as ViewStyle);
    if (variant === 'text') baseStyle.push(styles.buttonText as ViewStyle);
    
    // States
    if (disabled) baseStyle.push(styles.buttonDisabled as ViewStyle);
    
    // Additional styles
    if (style) baseStyle.push(style);
    
    return baseStyle;
  };
  
  // Text style based on variant
  const getTextStyle = () => {
    const baseStyle: StyleProp<TextStyle>[] = [styles.buttonLabel];
    
    if (size === 'small') baseStyle.push(styles.buttonLabelSmall as TextStyle);
    if (size === 'large') baseStyle.push(styles.buttonLabelLarge as TextStyle);
    
    if (variant === 'primary') baseStyle.push(styles.buttonLabelPrimary as TextStyle);
    if (variant === 'secondary') baseStyle.push(styles.buttonLabelSecondary as TextStyle);
    if (variant === 'outline') baseStyle.push(styles.buttonLabelOutline as TextStyle);
    if (variant === 'text') baseStyle.push(styles.buttonLabelText as TextStyle);
    
    if (disabled) baseStyle.push(styles.buttonLabelDisabled as TextStyle);
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : '#5b9bd5'} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={getTextStyle()}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonLarge: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#5b9bd5',
  },
  buttonSecondary: {
    backgroundColor: '#f0f7ff',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5b9bd5',
  },
  buttonText: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  buttonLabelSmall: {
    fontSize: 14,
  },
  buttonLabelLarge: {
    fontSize: 18,
  },
  buttonLabelPrimary: {
    color: '#fff',
  },
  buttonLabelSecondary: {
    color: '#5b9bd5',
  },
  buttonLabelOutline: {
    color: '#5b9bd5',
  },
  buttonLabelText: {
    color: '#5b9bd5',
  },
  buttonLabelDisabled: {
    opacity: 0.8,
  },
}); 