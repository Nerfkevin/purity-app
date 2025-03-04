import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Share, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

export interface ScriptureCardProps {
  text: string;
  reference: string;
  bookName?: string;
  chapter?: number;
  verse?: number;
  backgroundColor?: string;
  onSave?: () => void;
  onShare?: () => void;
  onReadContext?: () => void;
  showActions?: boolean;
}

export default function ScriptureCard({
  text,
  reference,
  bookName,
  chapter,
  verse,
  backgroundColor = '#fff',
  onSave,
  onShare,
  onReadContext,
  showActions = true,
}: ScriptureCardProps) {
  
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const shareText = `"${text}" - ${reference}\n\nShared from Purity app`;
    
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareText);
      }
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onSave) onSave();
  };

  const handleReadContext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onReadContext) onReadContext();
  };

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.verseText}>{text}</Text>
      <Text style={styles.reference}>{reference}</Text>
      
      {showActions && (
        <View style={styles.actions}>
          {onSave && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share size={16} color="#333" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          {onReadContext && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleReadContext}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BookOpen size={16} color="#333" />
              <Text style={styles.actionButtonText}>Context</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 12,
    color: '#333',
  },
  reference: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
}); 