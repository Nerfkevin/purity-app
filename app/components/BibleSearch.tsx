import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SearchIcon, Book, X } from 'lucide-react-native';
import { useBibleDatabase, BibleVerse } from '../../lib/hooks/useBibleDatabase';

interface BibleSearchProps {
  onSelectVerse?: (verse: BibleVerse) => void;
}

const BibleSearch: React.FC<BibleSearchProps> = ({ onSelectVerse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'text' | 'reference'>('text');
  const [books, setBooks] = useState<{id: number, name: string}[]>([]);
  const [selectedBook, setSelectedBook] = useState<{id: number, name: string} | null>(null);
  const [chapter, setChapter] = useState<string>('');
  const [verse, setVerse] = useState<string>('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  // Get database methods from our hook
  const { searchVerses, getAllBooks, getVerses, isInitialized } = useBibleDatabase();
  
  // Load books when database is initialized
  useEffect(() => {
    const loadBooks = async () => {
      if (!isInitialized) return;
      
      try {
        const allBooks = await getAllBooks();
        setBooks(allBooks);
      } catch (error) {
        console.error('Error loading books:', error);
      }
    };
    
    loadBooks();
  }, [isInitialized, getAllBooks]);

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchVerses(searchQuery);
      // Convert Scripture[] to BibleVerse[] to fix type mismatch
      const bibleVerses = results.map(scripture => ({
        id: Math.random(), // Generate a unique ID for each result
        book_id: 0, // This is a placeholder since we don't have the actual book_id
        chapter: scripture.chapter,
        verse: scripture.verse,
        text: scripture.text,
        book_name: scripture.book_name
      }));
      setSearchResults(bibleVerses);
    } catch (error) {
      console.error('Error searching Bible:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle reference search
  const handleReferenceSearch = async () => {
    if (!selectedBook || !chapter) return;
    
    setLoading(true);
    try {
      const verseNumber = verse ? parseInt(verse, 10) : undefined;
      const results = await getVerses(selectedBook.id, parseInt(chapter, 10), verseNumber);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching Bible by reference:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchType === 'text') {
      handleTextSearch();
    } else {
      handleReferenceSearch();
    }
  };

  // Handle verse selection
  const handleSelectVerse = (verse: BibleVerse) => {
    if (onSelectVerse) {
      onSelectVerse(verse);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedBook(null);
    setChapter('');
    setVerse('');
    setSearchResults([]);
  };

  // Format verse display
  const formatVerseDisplay = (verse: BibleVerse) => {
    return `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  };

  // Render verse item
  const renderVerseItem = ({ item }: { item: BibleVerse }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => handleSelectVerse(item)}
    >
      <Text style={styles.referenceText}>{formatVerseDisplay(item)}</Text>
      <Text style={styles.verseText} numberOfLines={2}>{item.text}</Text>
    </TouchableOpacity>
  );

  // Render book item for dropdown
  const renderBookItem = ({ item }: { item: {id: number, name: string} }) => (
    <TouchableOpacity 
      style={styles.bookItem} 
      onPress={() => {
        setSelectedBook(item);
        setShowBookDropdown(false);
      }}
    >
      <Text style={styles.bookItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchTypeToggle}>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            searchType === 'text' && styles.activeToggleButton
          ]}
          onPress={() => setSearchType('text')}
        >
          <Text 
            style={[
              styles.toggleButtonText,
              searchType === 'text' && styles.activeToggleButtonText
            ]}
          >
            Text Search
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            searchType === 'reference' && styles.activeToggleButton
          ]}
          onPress={() => setSearchType('reference')}
        >
          <Text 
            style={[
              styles.toggleButtonText,
              searchType === 'reference' && styles.activeToggleButtonText
            ]}
          >
            Reference Search
          </Text>
        </TouchableOpacity>
      </View>
      
      {searchType === 'text' ? (
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for words or phrases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleTextSearch}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <X size={18} color="#a89a5b" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.searchButton} onPress={handleTextSearch}>
            <SearchIcon size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.referenceSearchContainer}>
          <View style={styles.bookSelector}>
            <TouchableOpacity 
              style={styles.bookSelectorButton}
              onPress={() => setShowBookDropdown(!showBookDropdown)}
            >
              <Text style={styles.bookSelectorText}>
                {selectedBook ? selectedBook.name : 'Select Book'}
              </Text>
              <Book size={18} color="#a89a5b" />
            </TouchableOpacity>
            
            {showBookDropdown && (
              <View style={styles.bookDropdown}>
                <FlatList
                  data={books}
                  renderItem={renderBookItem}
                  keyExtractor={(item) => item && item.id !== undefined ? item.id.toString() : Math.random().toString()}
                  style={styles.bookList}
                />
              </View>
            )}
          </View>
          
          <View style={styles.chapterVerseContainer}>
            <TextInput
              style={styles.chapterInput}
              placeholder="Chapter"
              value={chapter}
              onChangeText={setChapter}
              keyboardType="number-pad"
            />
            <Text style={styles.separator}>:</Text>
            <TextInput
              style={styles.verseInput}
              placeholder="Verse"
              value={verse}
              onChangeText={setVerse}
              keyboardType="number-pad"
            />
          </View>
          
          <TouchableOpacity style={styles.referenceSearchButton} onPress={handleReferenceSearch}>
            <SearchIcon size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#d9b64e" style={styles.loader} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderVerseItem}
          keyExtractor={(item) => (item && item.id !== undefined ? item.id.toString() : Math.random().toString())}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
        />
      ) : (
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.emptyResultsText}>
            {searchQuery || selectedBook ? 'No results found' : 'Search for verses in the Bible'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchTypeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f0e8c9',
    borderRadius: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: '#d9b64e',
  },
  toggleButtonText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '500',
    color: '#5c5436',
  },
  activeToggleButtonText: {
    color: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e8c9',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    color: '#5c5436',
  },
  clearButton: {
    padding: 10,
    justifyContent: 'center',
  },
  searchButton: {
    backgroundColor: '#d9b64e',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  referenceSearchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bookSelector: {
    flex: 3,
    position: 'relative',
  },
  bookSelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0e8c9',
    borderRadius: 8,
  },
  bookSelectorText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    color: '#5c5436',
  },
  bookDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0e8c9',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 10,
    elevation: 5,
  },
  bookList: {
    flex: 1,
  },
  bookItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8c9',
  },
  bookItemText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    color: '#5c5436',
  },
  chapterVerseContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  chapterInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0e8c9',
    borderRadius: 8,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    color: '#5c5436',
  },
  separator: {
    paddingHorizontal: 8,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    color: '#5c5436',
  },
  verseInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0e8c9',
    borderRadius: 8,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    color: '#5c5436',
  },
  referenceSearchButton: {
    backgroundColor: '#d9b64e',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loader: {
    marginVertical: 20,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#d9b64e',
  },
  referenceText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 16,
    color: '#d9b64e',
    marginBottom: 4,
  },
  verseText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 14,
    color: '#5c5436',
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyResultsText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#a89a5b',
    textAlign: 'center',
  },
});

export default BibleSearch; 