import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Book, Search, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import BibleVerseComponent from '../components/BibleVerse';
import BibleSearch from '../components/BibleSearch';
import BibleView from '../components/BibleView';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useBibleDatabase, Scripture, BibleVerse } from '../../lib/hooks/useBibleDatabase';

type ScriptureView = 'daily' | 'bible';

export default function ScriptureScreen() {
  const router = useRouter();
  const [dailyScripture, setDailyScripture] = useState<Scripture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedSearchVerse, setSelectedSearchVerse] = useState<BibleVerse | null>(null);
  const [currentView, setCurrentView] = useState<ScriptureView>('daily');

  const { 
    isLoading: dbLoading, 
    error: dbError, 
    isInitialized,
    getDailyScripture,
    getVerse,
    searchVerses
  } = useBibleDatabase();

  useEffect(() => {
    const loadScripture = async () => {
      try {
        if (isInitialized && !dailyScripture) {
          console.log('Loading daily scripture...');
          setLoading(true);
          
          const scripture = await getDailyScripture();
          console.log('Daily scripture retrieved:', scripture);
          
          setDailyScripture(scripture);
          setError(null);
        }
      } catch (e: any) {
        console.error('Error loading daily scripture:', e);
        setError('Failed to load daily scripture');
      } finally {
        setLoading(false);
      }
    };

    loadScripture();
  }, [isInitialized, getDailyScripture, dailyScripture]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Save functionality would be implemented here
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!dailyScripture) return;
    
    const reference = `${dailyScripture.book_name} ${dailyScripture.chapter}:${dailyScripture.verse}`;
    const shareText = `"${dailyScripture.text}" - ${reference}\n\nShared from Purity app`;
    
    try {
      // In a real app, you would use a proper sharing implementation
      // that works on all platforms
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareText);
      }
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const handleReadContext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to full chapter view would be implemented here
    // router.push(`/bible/${dailyScripture.verse.book_id}/${dailyScripture.verse.chapter}`);
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectSearchVerse = (verse: BibleVerse) => {
    setSelectedSearchVerse(verse);
    setShowSearch(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleView = () => {
    setCurrentView(currentView === 'daily' ? 'bible' : 'daily');
    setShowSearch(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options).toUpperCase();
  };

  if (dbLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#d9b64e" />
        <Text style={styles.loadingText}>Loading today's scripture...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top']}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setError(null);
            setLoading(true);
            // Retry loading logic here
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentView === 'daily' ? 'Daily Scripture' : 'Bible'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={toggleView}
          >
            {currentView === 'daily' ? (
              <BookOpen size={20} color="#d9b64e" />
            ) : (
              <Book size={20} color="#d9b64e" />
            )}
          </TouchableOpacity>
          {currentView === 'daily' && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSearchToggle}
            >
              {showSearch ? (
                <Book size={20} color="#d9b64e" />
              ) : (
                <Search size={20} color="#d9b64e" />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.profileButton}>
            <User size={20} color="#d9b64e" />
          </TouchableOpacity>
        </View>
      </View>
      
      {currentView === 'bible' ? (
        <BibleView />
      ) : showSearch ? (
        <View style={styles.searchContainer}>
          <BibleSearch onSelectVerse={handleSelectSearchVerse} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          
          {selectedSearchVerse ? (
            <BibleVerseComponent
              verse={selectedSearchVerse}
              onPressSave={handleSave}
              onPressShare={handleShare}
              onPressReadContext={handleReadContext}
            />
          ) : dailyScripture ? (
            <BibleVerseComponent
              verse={{
                id: -1,
                book_id: -1,
                chapter: dailyScripture.chapter,
                verse: dailyScripture.verse,
                text: dailyScripture.text,
                book_name: dailyScripture.book_name
              }}
              title="Daily Scripture"
              application="Apply this verse to your life today."
              onPressSave={handleSave}
              onPressShare={handleShare}
              onPressReadContext={handleReadContext}
            />
          ) : (
            <View style={styles.noScriptureContainer}>
              <Text style={styles.noScriptureText}>No scripture available for today. Please check back later.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce59f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    paddingHorizontal: 20,
  },
  searchContainer: {
    flex: 1,
    padding: 20,
  },
  dateContainer: {
    paddingVertical: 16,
  },
  date: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 14,
    color: '#a89a5b',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7eed2',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7eed2',
    padding: 20,
  },
  errorText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#e35c5c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d9b64e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  noScriptureContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noScriptureText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
    textAlign: 'center',
  },
});