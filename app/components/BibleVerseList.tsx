import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { BibleVerse } from '../../lib/bibleDatabase';
import ScriptureCard from './common/ScriptureCard';

interface BibleVerseListProps {
  verses: BibleVerse[];
  loading?: boolean;
  error?: string | null;
  onVerseSelect?: (verse: BibleVerse) => void;
  onSaveVerse?: (verse: BibleVerse) => void;
  onShareVerse?: (verse: BibleVerse) => void;
  onReadContext?: (verse: BibleVerse) => void;
  emptyMessage?: string;
  showActions?: boolean;
}

export default function BibleVerseList({
  verses,
  loading = false,
  error = null,
  onVerseSelect,
  onSaveVerse,
  onShareVerse,
  onReadContext,
  emptyMessage = 'No verses found',
  showActions = true,
}: BibleVerseListProps) {
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5b9bd5" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (verses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={verses}
      keyExtractor={(item) => `${item.book_name}-${item.chapter}-${item.verse}`}
      renderItem={({ item }) => (
        <ScriptureCard
          text={item.text}
          reference={`${item.book_name} ${item.chapter}:${item.verse}`}
          bookName={item.book_name}
          chapter={item.chapter}
          verse={item.verse}
          onSave={onSaveVerse ? () => onSaveVerse(item) : undefined}
          onShare={onShareVerse ? () => onShareVerse(item) : undefined}
          onReadContext={onReadContext ? () => onReadContext(item) : undefined}
          showActions={showActions}
        />
      )}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#757575',
    fontSize: 16,
    textAlign: 'center',
  },
});