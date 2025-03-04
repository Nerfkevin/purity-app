import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { 
  openBibleDatabase, 
  executeSql,
  verifyDatabaseIntegrity,
  DATABASE_NAME,
  BibleBook,
  BibleVerse,
  Scripture,
  populateFromAsset
} from './bibleDatabaseUtils';
import { getDailyScripture, getEmergencyScripture } from './scriptureLists';

// Re-export interfaces and functions from the scriptureLists
export { 
  Scripture, 
  getDailyScripture, 
  getEmergencyScripture,
  BibleBook,
  BibleVerse,
  populateFromAsset
};

/**
 * Initialize the KJV Bible database
 * This should be called on app startup to ensure the database is ready
 */
export const initBibleDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing Bible database...');
    
    // Open the database and verify its integrity
    const db = await openBibleDatabase();
    const isValid = await verifyDatabaseIntegrity(db);
    
    if (!isValid) {
      console.warn('Database verification failed, attempting to recreate database...');
      
      // Delete the existing database file
      const dbPath = `${FileSystem.documentDirectory!}${DATABASE_NAME}`;
      await FileSystem.deleteAsync(dbPath).catch(() => {});
      
      // Try to copy from assets again
      const newDb = await openBibleDatabase();
      const isValidNow = await verifyDatabaseIntegrity(newDb);
      
      if (!isValidNow) {
        throw new Error('Failed to initialize Bible database');
      }
    }
    
    console.log('Bible database initialized successfully');
    return true;
  } catch (error) {
    console.error('Bible database initialization error:', error);
    return false;
  }
};

/**
 * For backward compatibility with existing code
 */
export const isDatabasePopulated = async (): Promise<boolean> => {
  const db = await openBibleDatabase();
  return await verifyDatabaseIntegrity(db);
};

/**
 * For backward compatibility with existing code
 */
export const emergencyDatabaseInit = async (): Promise<boolean> => {
  return await initBibleDatabase();
};

/**
 * Get a specific verse from the Bible
 */
export const getVerse = async (
  bookName: string,
  chapter: number,
  verseNumber: number
): Promise<Scripture | null> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT v.text, b.name as book_name, v.chapter, v.verse
       FROM KJV_verses v
       JOIN KJV_books b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = ? AND v.verse = ?`,
      [bookName, chapter, verseNumber]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const verse = results[0];
    return {
      book_name: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text
    };
  } catch (error) {
    console.error('Error getting verse:', error);
    return null;
  }
};

/**
 * Get all verses in a chapter
 */
export const getChapter = async (
  bookName: string,
  chapter: number
): Promise<Scripture[]> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT v.text, b.name as book_name, v.chapter, v.verse
       FROM KJV_verses v
       JOIN KJV_books b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [bookName, chapter]
    );
    
    return results.map(row => ({
      book_name: row.book_name,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text
    }));
  } catch (error) {
    console.error('Error getting chapter:', error);
    return [];
  }
};

/**
 * Get a random verse from the Bible
 */
export const getRandomVerse = async (): Promise<Scripture | null> => {
  try {
    const db = await openBibleDatabase();
    
    // Get the total number of verses
    const countResult = await executeSql(
      db,
      "SELECT COUNT(*) as count FROM KJV_verses"
    );
    
    const count = countResult[0].count;
    const randomId = Math.floor(Math.random() * count) + 1;
    
    // Get a random verse
    const results = await executeSql(
      db,
      `SELECT v.text, b.name as book_name, v.chapter, v.verse
       FROM KJV_verses v
       JOIN KJV_books b ON v.book_id = b.id
       WHERE v.id = ?`,
      [randomId]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const verse = results[0];
    return {
      book_name: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text
    };
  } catch (error) {
    console.error('Error getting random verse:', error);
    return null;
  }
};

/**
 * Search for verses containing specific text
 */
export const searchVerses = async (
  searchText: string,
  limit: number = 20
): Promise<Scripture[]> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT v.text, b.name as book_name, v.chapter, v.verse
       FROM KJV_verses v
       JOIN KJV_books b ON v.book_id = b.id
       WHERE v.text LIKE ?
       LIMIT ?`,
      [`%${searchText}%`, limit]
    );
    
    return results.map(row => ({
      book_name: row.book_name,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text
    }));
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
};

/**
 * Get all books in the Bible
 */
export const getAllBooks = async (): Promise<BibleBook[]> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT id, name FROM KJV_books ORDER BY id`
    );
    
    return results.map(row => ({
      id: row.id,
      name: row.name
    }));
  } catch (error) {
    console.error('Error getting books:', error);
    return [];
  }
};

/**
 * Get the number of chapters in a book
 */
export const getChapterCount = async (bookId: number): Promise<number> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT MAX(chapter) as chapter_count 
       FROM KJV_verses 
       WHERE book_id = ?`,
      [bookId]
    );
    
    if (results.length === 0) {
      return 0;
    }
    
    return results[0].chapter_count || 0;
  } catch (error) {
    console.error('Error getting chapter count:', error);
    return 0;
  }
};

/**
 * Get all verses in a chapter by book ID
 */
export const getVerses = async (
  bookId: number,
  chapter: number
): Promise<BibleVerse[]> => {
  try {
    const db = await openBibleDatabase();
    const results = await executeSql(
      db,
      `SELECT v.*, b.name as book_name
       FROM KJV_verses v
       JOIN KJV_books b ON v.book_id = b.id
       WHERE v.book_id = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [bookId, chapter]
    );
    
    return results.map(row => ({
      id: row.id,
      book_id: row.book_id,
      chapter: row.chapter,
      verse: row.verse,
      text: row.text,
      book_name: row.book_name
    }));
  } catch (error) {
    console.error('Error getting verses:', error);
    return [];
  }
};

/**
 * Check if the database has been initialized
 * For backward compatibility with existing code
 */
export const isDatabaseInitialized = async (): Promise<boolean> => {
  return await isDatabasePopulated();
}; 