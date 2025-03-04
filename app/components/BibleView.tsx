import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBibleDatabase, BibleBook, BibleVerse } from '../../lib/hooks/useBibleDatabase';

type NavigationState = 'books' | 'chapters' | 'verses';

const BibleView: React.FC = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState>('books');

  // Use our database hook
  const { 
    isInitialized,
    getAllBooks, 
    getChapterCount,
    getVerses,
    status
  } = useBibleDatabase();

  // Load all Bible books when initialized
  useEffect(() => {
    if (isInitialized) {
      loadBooks();
    }
  }, [isInitialized]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      console.log('BibleView: Loading all books...');
      const allBooks = await getAllBooks();
      console.log(`BibleView: Retrieved ${allBooks.length} books`);
      
      if (allBooks.length === 0) {
        console.error('BibleView: No books returned from getAllBooks');
      }
      
      setBooks(allBooks);
      setLoading(false);
    } catch (error) {
      console.error('BibleView: Error loading books:', error);
      setLoading(false);
    }
  };

  // Get chapters for the selected book
  const handleBookSelect = async (book: BibleBook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      setSelectedBook(book);
      setLoading(true);
      
      console.log(`BibleView: Getting chapters for book ${book.name} (ID: ${book.id})...`);
      // Get the number of chapters in this book
      const maxChapter = await getChapterCount(book.id);
      console.log(`BibleView: Book ${book.name} has ${maxChapter} chapters`);
      
      if (maxChapter > 0) {
        const chaptersArray = Array.from({length: maxChapter}, (_, i) => i + 1);
        setChapters(chaptersArray);
      } else {
        console.error(`BibleView: No chapters found for book ${book.name}`);
        setChapters([]);
      }
      
      setNavigationState('chapters');
      setLoading(false);
    } catch (error) {
      console.error('BibleView: Error selecting book:', error);
      setLoading(false);
    }
  };

  // Get verses for the selected chapter
  const handleChapterSelect = async (chapter: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!selectedBook) return;
    
    try {
      setSelectedChapter(chapter);
      setLoading(true);
      
      console.log(`BibleView: Getting verses for ${selectedBook.name} chapter ${chapter}...`);
      // Get verses using our hook function
      const chapterVerses = await getVerses(selectedBook.id, chapter);
      console.log(`BibleView: Retrieved ${chapterVerses.length} verses for ${selectedBook.name} chapter ${chapter}`);
      
      if (chapterVerses.length === 0) {
        console.error(`BibleView: No verses found for ${selectedBook.name} chapter ${chapter}`);
      }
      
      setVerses(chapterVerses);
      
      setNavigationState('verses');
      setLoading(false);
    } catch (error) {
      console.error('BibleView: Error selecting chapter:', error);
      setLoading(false);
    }
  };

  // Navigation back handler
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (navigationState === 'verses') {
      setNavigationState('chapters');
      setVerses([]);
    } else if (navigationState === 'chapters') {
      setNavigationState('books');
      setSelectedBook(null);
      setChapters([]);
    }
  };

  // Render book list
  const renderBookList = () => (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => handleBookSelect(item)}
        >
          <Text style={styles.bookTitle}>{item.name}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
    />
  );

  // Render chapter list
  const renderChapterList = () => (
    <FlatList
      data={chapters}
      numColumns={5}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.chapterButton}
          onPress={() => handleChapterSelect(item)}
        >
          <Text style={styles.chapterNumber}>{item}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.gridContent}
    />
  );

  // Render verse list
  const renderVerseList = () => (
    <FlatList
      data={verses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.verseContainer}>
          <Text style={styles.verseNumber}>{item.verse}</Text>
          <Text style={styles.verseText}>{item.text}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {navigationState !== 'books' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {navigationState === 'books' 
            ? 'Bible'
            : navigationState === 'chapters' 
              ? selectedBook?.name
              : `${selectedBook?.name} ${selectedChapter}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {navigationState === 'books' && renderBookList()}
          {navigationState === 'chapters' && renderChapterList()}
          {navigationState === 'verses' && renderVerseList()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#0f172a',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gridContent: {
    padding: 16,
    alignItems: 'center',
  },
  itemContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  bookTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#0f172a',
  },
  chapterButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chapterNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#3b82f6',
  },
  verseContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  verseNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#3b82f6',
    width: 30,
    paddingTop: 2,
  },
  verseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#0f172a',
    flex: 1,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
});

export default BibleView; 