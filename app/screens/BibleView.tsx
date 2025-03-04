import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import BibleDatabaseManager from '../../components/BibleDatabaseManager';
import { useBibleDatabase } from '../../lib/hooks/useBibleDatabase';
import { BibleBook, BibleVerse } from '../../lib/bibleDatabase';

const BibleView: React.FC = () => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [chapterCount, setChapterCount] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { loadAllBooks, loadBookChapters, loadChapterVerses, diagnosticMessage } = useBibleDatabase();
  
  // Load books when database is ready
  useEffect(() => {
    if (isDatabaseReady) {
      const loadBooks = async () => {
        try {
          setIsLoading(true);
          setErrorMessage(null);
          
          console.log('BibleView: Loading all books...');
          const allBooks = await loadAllBooks();
          setBooks(allBooks);
          console.log(`BibleView: Retrieved ${allBooks.length} books`);
          
          if (allBooks.length === 0) {
            setErrorMessage('No Bible books found. The database may be corrupted.');
          }
        } catch (error) {
          console.error('Error loading books:', error);
          setErrorMessage('Failed to load Bible books');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadBooks();
    }
  }, [isDatabaseReady, loadAllBooks]);
  
  // Handle book selection
  const handleBookSelect = async (book: BibleBook) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedBook(book);
      
      console.log(`BibleView: Getting chapters for book ${book.name} (ID: ${book.id})...`);
      const count = await loadBookChapters(book.id);
      setChapterCount(count);
      console.log(`BibleView: Book ${book.name} has ${count} chapters`);
      
      if (count === 0) {
        setErrorMessage(`No chapters found for ${book.name}`);
        // Still show chapter 1 as fallback
        setChapterCount(1);
      }
      
      setView('chapters');
    } catch (error) {
      console.error(`Error loading chapters for ${book.name}:`, error);
      setErrorMessage(`Failed to load chapters for ${book.name}`);
      // Still show chapter 1 as fallback
      setChapterCount(1);
      setView('chapters');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle chapter selection
  const handleChapterSelect = async (chapter: number) => {
    if (!selectedBook) return;
    
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedChapter(chapter);
      
      console.log(`BibleView: Getting verses for ${selectedBook.name} chapter ${chapter}...`);
      const chapterVerses = await loadChapterVerses(selectedBook.id, chapter);
      setVerses(chapterVerses);
      console.log(`BibleView: Retrieved ${chapterVerses.length} verses for ${selectedBook.name} chapter ${chapter}`);
      
      if (chapterVerses.length === 0) {
        setErrorMessage(`No verses found for ${selectedBook.name} chapter ${chapter}`);
      }
      
      setView('verses');
    } catch (error) {
      console.error(`Error loading verses for ${selectedBook?.name} chapter ${chapter}:`, error);
      setErrorMessage(`Failed to load verses for ${selectedBook?.name} chapter ${chapter}`);
      setVerses([]);
      setView('verses');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (view === 'verses') {
      setView('chapters');
      setVerses([]);
      setErrorMessage(null);
    } else if (view === 'chapters') {
      setView('books');
      setSelectedBook(null);
      setChapterCount(0);
      setErrorMessage(null);
    }
  };
  
  // Render loading indicator
  const renderLoading = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  };
  
  // Render error message
  const renderError = () => {
    if (!errorMessage) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  };
  
  // Render limited content message
  const renderLimitedContentMessage = () => {
    if (!diagnosticMessage || !diagnosticMessage.includes('Limited Bible content')) return null;
    
    return (
      <View style={styles.limitedContentContainer}>
        <Text style={styles.limitedContentText}>
          Limited Bible content available. Only selected verses are included.
        </Text>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = (message: string) => {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };
  
  // Render different views
  const renderContent = () => {
    if (!isDatabaseReady) {
      return (
        <BibleDatabaseManager
          onReady={() => setIsDatabaseReady(true)}
        />
      );
    }
    
    switch (view) {
      case 'books':
        return (
          <>
            {renderLimitedContentMessage()}
            {renderError()}
            {books.length === 0 && !isLoading ? 
              renderEmptyState('No Bible books available') : 
              <FlatList
                data={books}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.item}
                    onPress={() => handleBookSelect(item)}
                  >
                    <Text style={styles.itemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            }
            {renderLoading()}
          </>
        );
        
      case 'chapters':
        return (
          <>
            {renderError()}
            {chapterCount === 0 && !isLoading ? 
              renderEmptyState(`No chapters available for ${selectedBook?.name}`) : 
              <FlatList
                data={Array.from({ length: chapterCount }, (_, i) => i + 1)}
                keyExtractor={item => item.toString()}
                numColumns={5}
                columnWrapperStyle={styles.chapterGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.chapterItem}
                    onPress={() => handleChapterSelect(item)}
                  >
                    <Text style={styles.chapterText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            }
            {renderLoading()}
          </>
        );
        
      case 'verses':
        return (
          <>
            {renderError()}
            {verses.length === 0 && !isLoading ? 
              renderEmptyState(`No verses available for ${selectedBook?.name} chapter ${selectedChapter}`) : 
              <FlatList
                data={verses}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.verse}>
                    <Text style={styles.verseNumber}>{item.verse}</Text>
                    <Text style={styles.verseText}>{item.text}</Text>
                  </View>
                )}
              />
            }
            {renderLoading()}
          </>
        );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {view !== 'books' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {view === 'books' && 'Bible Books'}
          {view === 'chapters' && selectedBook?.name}
          {view === 'verses' && `${selectedBook?.name} ${selectedChapter}`}
        </Text>
      </View>
      
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemText: {
    fontSize: 16
  },
  chapterGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16
  },
  chapterItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    margin: 8
  },
  chapterText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  verse: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#666',
    alignSelf: 'flex-start',
    marginTop: 2
  },
  verseText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24
  },
  backButton: {
    padding: 16,
    paddingBottom: 0
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  limitedContentContainer: {
    padding: 12,
    backgroundColor: '#fff9c4',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#fdd835'
  },
  limitedContentText: {
    fontSize: 14,
    color: '#5d4037',
    textAlign: 'center'
  }
});

export default BibleView; 