import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import BackButton from './BackButton';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  backButtonColor?: string;
}

export default function Header({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
  containerStyle,
  titleStyle,
  backButtonColor,
}: HeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <BackButton 
            onPress={onBackPress} 
            color={backButtonColor}
          />
        )}
      </View>
      
      <Text 
        style={[styles.title, titleStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftSection: {
    minWidth: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
}); 