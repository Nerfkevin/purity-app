import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { Heart, Share2, BookOpen, ChevronRight } from 'lucide-react-native';

// Import types from our database utility
import { BibleVerse as BibleVerseType } from '../../lib/bibleDatabase';

interface BibleVerseProps {
  verse: BibleVerseType;
  reference?: string;
  title?: string;
  application?: string;
  imageUrl?: string;
  onPressReadContext?: () => void;
  onPressSave?: () => void;
  onPressShare?: () => void;
}

const BibleVerseComponent: React.FC<BibleVerseProps> = ({
  verse,
  reference,
  title,
  application,
  imageUrl = 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  onPressReadContext,
  onPressSave,
  onPressShare,
}) => {
  const [saved, setSaved] = useState(false);
  
  // Generate verse reference if not provided
  const displayReference = reference || `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  
  // Handle save action
  const handleSave = () => {
    setSaved(!saved);
    if (onPressSave) {
      onPressSave();
    }
  };
  
  // Handle share action
  const handleShare = () => {
    if (onPressShare) {
      onPressShare();
    }
  };
  
  // Handle read context action
  const handleReadContext = () => {
    if (onPressReadContext) {
      onPressReadContext();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scriptureCard}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.scriptureImage}
        />
        
        <View style={styles.scriptureContent}>
          {title && <Text style={styles.scriptureTitle}>{title}</Text>}
          
          <Text style={styles.scriptureVerse}>"{verse.text}"</Text>
          <Text style={styles.scriptureReference}>{displayReference}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Heart size={20} color={saved ? '#ef4444' : '#a89a5b'} fill={saved ? '#ef4444' : 'transparent'} />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color="#a89a5b" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.contextButton} onPress={handleReadContext}>
        <View style={styles.contextButtonContent}>
          <BookOpen size={20} color="#d9b64e" />
          <Text style={styles.contextButtonText}>Read in Context</Text>
        </View>
        <ChevronRight size={20} color="#a89a5b" />
      </TouchableOpacity>
      
      {application && (
        <View style={styles.applicationSection}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Text style={styles.applicationText}>{application}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scriptureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  scriptureImage: {
    width: '100%',
    height: 180,
  },
  scriptureContent: {
    padding: 20,
  },
  scriptureTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '700',
    fontSize: 18,
    color: '#d9b64e',
    marginBottom: 12,
  },
  scriptureVerse: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 20,
    color: '#5c5436',
    lineHeight: 28,
    marginBottom: 8,
  },
  scriptureReference: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '500',
    fontSize: 16,
    color: '#a89a5b',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0e8c9',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '500',
    fontSize: 14,
    color: '#a89a5b',
    marginLeft: 6,
  },
  contextButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  contextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '500',
    fontSize: 16,
    color: '#5c5436',
    marginLeft: 12,
  },
  applicationSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 18,
    color: '#5c5436',
    marginBottom: 12,
  },
  applicationText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#5c5436',
    lineHeight: 24,
  },
});

export default BibleVerseComponent; 