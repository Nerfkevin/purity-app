import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, BookOpen, ChevronRight, User } from 'lucide-react-native';

export default function ScriptureScreen() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Scripture</Text>
        <TouchableOpacity style={styles.profileButton}>
          <User size={20} color="#d9b64e" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>JUNE 15, 2025</Text>
        </View>
        
        <View style={styles.scriptureCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' }} 
            style={styles.scriptureImage}
          />
          
          <View style={styles.scriptureContent}>
            <Text style={styles.scriptureVerse}>"Blessed are the pure in heart, for they will see God."</Text>
            <Text style={styles.scriptureReference}>Matthew 5:8</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                <Heart size={20} color={saved ? '#ef4444' : '#a89a5b'} fill={saved ? '#ef4444' : 'transparent'} />
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Share2 size={20} color="#a89a5b" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.contextButton}>
          <View style={styles.contextButtonContent}>
            <BookOpen size={20} color="#d9b64e" />
            <Text style={styles.contextButtonText}>Read in Context</Text>
          </View>
          <ChevronRight size={20} color="#a89a5b" />
        </TouchableOpacity>
        
        <View style={styles.applicationSection}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Text style={styles.applicationText}>
            Jesus teaches that purity of heart is essential for spiritual sight. In our digital age, this means guarding what we allow our eyes to see and our minds to dwell on. Today, practice intentional media consumption by:
          </Text>
          
          <View style={styles.applicationPoints}>
            <View style={styles.applicationPoint}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText}>Taking a moment to pray before opening social media</Text>
            </View>
            
            <View style={styles.applicationPoint}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText}>Immediately closing content that triggers impure thoughts</Text>
            </View>
            
            <View style={styles.applicationPoint}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText}>Replacing lustful thoughts with meditation on God's word</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8c9',
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
  scrollView: {
    flex: 1,
  },
  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  date: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 14,
    color: '#a89a5b',
    letterSpacing: 1,
  },
  scriptureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
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
    marginHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  applicationPoints: {
    marginTop: 8,
  },
  applicationPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d9b64e',
    marginTop: 8,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#5c5436',
    lineHeight: 24,
  },
});