import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  repairDatabase,
  isDatabaseHealthy,
  getDatabase,
  getVerse,
  getChapter,
  getAllBooks,
  getChapterCount,
  getVerses,
  searchVerses,
  getRandomVerse,
  BibleBook,
  BibleVerse,
  Scripture,
  copyDatabaseFromAssets
} from '../database/bibleDatabaseService';
import { getDailyScripture } from '../database/scriptureService';

// Status of the Bible database
export enum BibleDatabaseStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  REPAIR = 'repair'
}

// Re-export the interfaces so consumers can import from this hook
export { BibleBook, BibleVerse, Scripture };

// Hook for Bible database operations
export const useBibleDatabase = () => {
  const [status, setStatus] = useState<BibleDatabaseStatus>(BibleDatabaseStatus.LOADING);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [diagnosticMessage, setDiagnosticMessage] = useState<string>('');

  // Initialize the database
  const initDatabase = useCallback(async () => {
    if (isInitialized) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Initializing Bible database...');
      setIsLoading(true);
      
      // Get database and check if it's healthy
      const db = await getDatabase();
      const isPopulated = await isDatabaseHealthy(db);
      
      if (isPopulated) {
        // Database is already populated and verified
        setStatus(BibleDatabaseStatus.READY);
        setIsInitialized(true);
      } else {
        // Populate the database
        console.log('Database not populated, attempting to populate...');
        try {
          await copyDatabaseFromAssets();
          const db = await getDatabase();
          const isHealthyNow = await isDatabaseHealthy(db);
          
          if (isHealthyNow) {
            setStatus(BibleDatabaseStatus.READY);
            setIsInitialized(true);
          } else {
            setStatus(BibleDatabaseStatus.ERROR);
            setDiagnosticMessage('Failed to initialize Bible database');
          }
        } catch (populateError) {
          console.error('Error populating database:', populateError);
          setStatus(BibleDatabaseStatus.ERROR);
          setDiagnosticMessage('Failed to initialize Bible database');
        }
      }
    } catch (error) {
      console.error('Error initializing Bible database:', error);
      setStatus(BibleDatabaseStatus.ERROR);
      setDiagnosticMessage('Error initializing database: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Effect to initialize database on mount
  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  // Function to repair the database
  const repairDatabaseHandler = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setStatus(BibleDatabaseStatus.LOADING);
      setDiagnosticMessage('Attempting to repair database...');
      
      // Attempt to repair the database
      const success = await repairDatabase();
      
      if (success) {
        setStatus(BibleDatabaseStatus.READY);
        setIsInitialized(true);
        setDiagnosticMessage('Database repaired successfully.');
        return true;
      } else {
        setStatus(BibleDatabaseStatus.ERROR);
        setDiagnosticMessage('Failed to repair database.');
        return false;
      }
    } catch (error) {
      console.error('Error repairing database:', error);
      setStatus(BibleDatabaseStatus.ERROR);
      setDiagnosticMessage('Error repairing database: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Show a repair dialog
  const showRepairDialog = () => {
    Alert.alert(
      'Bible Database Issue',
      'There appears to be an issue with the Bible database. Would you like to attempt a repair?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Repair',
          onPress: repairDatabaseHandler
        }
      ],
      { cancelable: false }
    );
  };

  // Load all books with caching
  const loadAllBooks = async (): Promise<BibleBook[]> => {
    try {
      const fetchedBooks = await getAllBooks();
      setBooks(fetchedBooks);
      return fetchedBooks;
    } catch (error) {
      console.error('Error loading books:', error);
      return [];
    }
  };

  return {
    // Status
    status,
    isLoading,
    isInitialized,
    diagnosticMessage,
    
    // Management functions
    initDatabase,
    repairDatabase: repairDatabaseHandler,
    showRepairDialog,
    
    // Cache
    books,
    
    // Database operations
    getVerse,
    getChapter,
    getAllBooks: loadAllBooks,
    getChapterCount,
    searchVerses,
    getRandomVerse,
    getVerses,
    getDailyScripture
  };
}; 