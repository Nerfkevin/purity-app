/**
 * Bible Database Hook
 * 
 * This custom hook provides a centralized way to access Bible database functionality
 * throughout the app with React state integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as bibleService from '../database/bibleDatabaseService';
import * as scriptureService from '../database/scriptureService';

// Status of the Bible database
export enum BibleDatabaseStatus {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  REPAIR = 'repair'
}

// Re-export types for convenience
export type { BibleBook, BibleVerse, Scripture } from '../database/bibleDatabaseService';
export type { EmergencyCategory, ScriptureReference } from '../database/scriptureService';
// Re-export the EmergencyCategory type directly to fix import issues
export { EmergencyCategory } from '../database/scriptureService';

// Bible database hook
export const useBibleDatabase = () => {
  // State for database status
  const [status, setStatus] = useState<BibleDatabaseStatus>(BibleDatabaseStatus.LOADING);
  const [diagnosticMessage, setDiagnosticMessage] = useState<string>('');
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the database
  useEffect(() => {
    const initDatabase = async () => {
      if (isInitialized) {
        console.log('Database already initialized, skipping initialization');
        return;
      }

      try {
        console.log('Initializing Bible database...');
        setIsLoading(true);
        
        // Get database and verify it's healthy
        const db = await bibleService.getDatabase();
        const isHealthy = await bibleService.isDatabaseHealthy(db);
        
        if (isHealthy) {
          setStatus(BibleDatabaseStatus.READY);
          setDiagnosticMessage('Database looks healthy');
          setIsInitialized(true);
        } else {
          setStatus(BibleDatabaseStatus.REPAIR);
          setDiagnosticMessage('Database needs repair. Please use the repair function.');
        }
      } catch (error) {
        console.error('Error initializing Bible database:', error);
        setStatus(BibleDatabaseStatus.ERROR);
        setDiagnosticMessage('Failed to initialize database');
        setError('Failed to initialize Bible database');
      } finally {
        setIsLoading(false);
      }
    };
    
    initDatabase();
  }, [isInitialized]); 
  
  // Repair database
  const repairDatabase = useCallback(async () => {
    try {
      setIsRepairing(true);
      console.log('Attempting to repair Bible database...');
      
      // Repair the database
      const success = await bibleService.repairDatabase();
      
      if (success) {
        setStatus(BibleDatabaseStatus.READY);
        setDiagnosticMessage('Database successfully repaired');
        setIsInitialized(true);
      } else {
        setStatus(BibleDatabaseStatus.ERROR);
        setDiagnosticMessage('Failed to repair database');
      }
    } catch (error) {
      console.error('Error repairing database:', error);
      setStatus(BibleDatabaseStatus.ERROR);
      setDiagnosticMessage('Repair attempt failed with error');
    } finally {
      setIsRepairing(false);
    }
  }, []);
  
  // Show repair dialog
  const showRepairDialog = useCallback(() => {
    Alert.alert(
      'Bible Database Issue',
      `${diagnosticMessage}\n\nWould you like to repair the database?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Repair',
          onPress: repairDatabase,
        },
      ]
    );
  }, [diagnosticMessage, repairDatabase]);
  
  // Callback for getting verse
  const getVerse = useCallback(async (
    bookName: string, 
    chapter: number, 
    verse: number
  ) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return null;
    }
    
    return await bibleService.getVerse(bookName, chapter, verse);
  }, [status, showRepairDialog]);
  
  // Callback for getting chapter
  const getChapter = useCallback(async (
    bookName: string, 
    chapter: number
  ) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return [];
    }
    
    return await bibleService.getChapter(bookName, chapter);
  }, [status, showRepairDialog]);
  
  // Callback for searching verses
  const searchVerses = useCallback(async (
    searchText: string, 
    limit: number = 20
  ) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return [];
    }
    
    return await bibleService.searchVerses(searchText, limit);
  }, [status, showRepairDialog]);
  
  // Callback for getting all books
  const getAllBooks = useCallback(async () => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return [];
    }
    
    return await bibleService.getAllBooks();
  }, [status, showRepairDialog]);
  
  // Callback for getting chapter count
  const getChapterCount = useCallback(async (bookId: number) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return 0;
    }
    
    return await bibleService.getChapterCount(bookId);
  }, [status, showRepairDialog]);
  
  // Callback for getting verses
  const getVerses = useCallback(async (
    bookId: number, 
    chapter: number
  ) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return [];
    }
    
    return await bibleService.getVerses(bookId, chapter);
  }, [status, showRepairDialog]);
  
  // Callback for getting random verse
  const getRandomVerse = useCallback(async () => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return null;
    }
    
    return await bibleService.getRandomVerse();
  }, [status, showRepairDialog]);
  
  // Callback for getting daily scripture
  const getDailyScripture = useCallback(async () => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return null;
    }
    
    return await scriptureService.getDailyScripture();
  }, [status, showRepairDialog]);
  
  // Callback for getting emergency scripture
  const getEmergencyScripture = useCallback(async (category: scriptureService.EmergencyCategory = scriptureService.EmergencyCategory.TEMPTATION) => {
    if (status !== BibleDatabaseStatus.READY) {
      if (status === BibleDatabaseStatus.REPAIR) {
        showRepairDialog();
      }
      return null;
    }
    
    return await scriptureService.getEmergencyScripture(category);
  }, [status, showRepairDialog]);
  
  // Return the hook API
  return {
    // Status
    status,
    isInitialized,
    isLoading,
    isRepairing,
    error,
    diagnosticMessage,
    
    // Actions
    repairDatabase,
    showRepairDialog,
    
    // Bible access methods
    getVerse,
    getChapter,
    searchVerses,
    getAllBooks,
    getChapterCount,
    getVerses,
    getRandomVerse,
    
    // Special scripture methods
    getDailyScripture,
    getEmergencyScripture
  };
};
