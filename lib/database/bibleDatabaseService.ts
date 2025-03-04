/**
 * Bible Database Service
 * 
 * This service handles all interactions with the SQLite Bible database.
 * It provides methods to query verses, chapters, and books.
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Define types for Bible database
export interface BibleBook {
  id: number;
  name: string;
}

export interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  book_name?: string; // Used when joining with books table
}

export interface Scripture {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

// Database configuration
const DATABASE_NAME = 'KJV.db';

// Fixed table names - do not change these as they match the KJV.db structure
const BOOKS_TABLE = 'KJV_books';
const VERSES_TABLE = 'KJV_verses';

// Singleton instance
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Get database connection instance
 * @returns SQLite database instance
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    console.log('Opening Bible database connection...');
    
    // Directly open the database from the asset source
    // This is the recommended way in Expo SQLite v15+
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
      // @ts-ignore - assetSource is available in Expo SQLite v15+ but not typed
      assetSource: require('../../assets/db/KJV.db'),
      readOnly: true
    });
    
    console.log(`Database opened successfully`);
    
    // Debug database structure
    console.log('Checking database structure for troubleshooting:');
    await debugDatabaseStructure();
    
    return dbInstance;
  } catch (error) {
    console.error('Error initializing Bible database:', error);
    throw new Error('Failed to initialize Bible database');
  }
};

/**
 * Check if database is healthy with proper tables and data
 */
export const isDatabaseHealthy = async (db: SQLite.SQLiteDatabase): Promise<boolean> => {
  try {
    // Test with query to get all table names
    const tables = await db.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    
    if (tables.length === 0) {
      console.error('No tables found in database');
      return false;
    }
    
    console.log('Tables found:', tables.map(t => t.name).join(', '));
    
    // Check if our required tables exist
    const hasBooks = tables.some(t => t.name === BOOKS_TABLE);
    const hasVerses = tables.some(t => t.name === VERSES_TABLE);
    
    if (!hasBooks) {
      console.error(`Required table ${BOOKS_TABLE} not found`);
    }
    
    if (!hasVerses) {
      console.error(`Required table ${VERSES_TABLE} not found`);
    }
    
    if (!hasBooks || !hasVerses) {
      return false;
    }
    
    // Check if we can query the tables we found
    try {
      const bookCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${BOOKS_TABLE}`
      );
      console.log(`Found ${bookCount?.count || 0} books`);
      
      const verseCount = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${VERSES_TABLE}`
      );
      console.log(`Found ${verseCount?.count || 0} verses`);
      
      // If we have books and verses, we're good to go
      return (bookCount?.count || 0) > 0 && (verseCount?.count || 0) > 0;
    } catch (error) {
      console.error('Error querying tables:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking database health:', error);
    return false;
  }
};

/**
 * Debug function to examine database structure
 * Useful for troubleshooting when tables aren't found
 */
export const debugDatabaseStructure = async (): Promise<void> => {
  try {
    if (!dbInstance) {
      console.log('Database not initialized yet');
      return;
    }
    
    // Get all tables
    const tables = await dbInstance.getAllAsync<{ name: string, type: string }>(
      `SELECT name, type FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );
    
    console.log(`Database contains ${tables.length} tables:`);
    for (const table of tables) {
      console.log(`- ${table.name} (${table.type})`);
      
      try {
        // Get column info for each table
        const columns = await dbInstance.getAllAsync<{ name: string, type: string }>(
          `PRAGMA table_info(${table.name})`
        );
        
        console.log(`  Columns: ${columns.map(col => `${col.name} (${col.type})`).join(', ')}`);
        
        // Get row count for each table
        const countResult = await dbInstance.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM "${table.name}" LIMIT 1`
        );
        
        console.log(`  Row count: ${countResult?.count || 0}`);
      } catch (error) {
        console.log(`  Error getting table details for ${table.name}: ${error}`);
      }
    }
    
    // If no tables found, check SQLite version
    if (tables.length === 0) {
      try {
        const version = await dbInstance.getFirstAsync<{ sqlite_version: string }>(
          `SELECT sqlite_version()`
        );
        console.log(`SQLite version: ${version?.sqlite_version || 'unknown'}`);
      } catch (error) {
        console.log(`Error getting SQLite version: ${error}`);
      }
    }
  } catch (error) {
    console.error('Error debugging database structure:', error);
  }
};

/**
 * Execute SQL query with error handling
 */
export const executeSql = async (
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('SQL Error:', error, 'Query:', sql, 'Params:', params);
    throw error;
  }
};

/**
 * Execute a write SQL query (INSERT, UPDATE, DELETE)
 */
export const executeWriteSql = async (
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> => {
  try {
    return await db.runAsync(sql, params);
  } catch (error) {
    console.error('SQL Write Error:', error, 'Query:', sql, 'Params:', params);
    throw error;
  }
};

/**
 * Get a verse by book name, chapter, and verse number
 */
export const getVerse = async (
  bookName: string, 
  chapter: number, 
  verse: number
): Promise<Scripture | null> => {
  try {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync(
      `SELECT b.name as book_name, v.chapter, v.verse, v.text
       FROM ${VERSES_TABLE} v
       JOIN ${BOOKS_TABLE} b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = ? AND v.verse = ?`,
      [bookName, chapter, verse]
    );
    
    if (!result) {
      return null;
    }
    
    return result as Scripture;
  } catch (error) {
    console.error(`Error getting verse ${bookName} ${chapter}:${verse}:`, error);
    return null;
  }
};

/**
 * Get all verses for a chapter
 */
export const getChapter = async (
  bookName: string, 
  chapter: number
): Promise<Scripture[]> => {
  try {
    const db = await getDatabase();
    
    const result = await executeSql(
      db,
      `SELECT b.name as book_name, v.chapter, v.verse, v.text
       FROM ${VERSES_TABLE} v
       JOIN ${BOOKS_TABLE} b ON v.book_id = b.id
       WHERE b.name = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [bookName, chapter]
    );
    
    const verses: Scripture[] = [];
    for (let i = 0; i < result.length; i++) {
      verses.push(result[i] as Scripture);
    }
    
    return verses;
  } catch (error) {
    console.error(`Error getting chapter ${bookName} ${chapter}:`, error);
    return [];
  }
};

/**
 * Get a random verse from the database
 */
export const getRandomVerse = async (): Promise<Scripture | null> => {
  try {
    const db = await getDatabase();
    
    // Count total verses
    const countResult = await executeSql(
      db,
      `SELECT COUNT(*) as count FROM ${VERSES_TABLE}`
    );
    const count = countResult[0].count;
    
    // Get a random verse ID
    const randomId = Math.floor(Math.random() * count) + 1;
    
    const result = await executeSql(
      db,
      `SELECT b.name as book_name, v.chapter, v.verse, v.text
       FROM ${VERSES_TABLE} v
       JOIN ${BOOKS_TABLE} b ON v.book_id = b.id
       LIMIT 1 OFFSET ?`,
      [randomId - 1]
    );
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as Scripture;
  } catch (error) {
    console.error('Error getting random verse:', error);
    return null;
  }
};

/**
 * Search for verses containing the search text
 */
export const searchVerses = async (
  searchText: string, 
  limit: number = 20
): Promise<Scripture[]> => {
  try {
    const db = await getDatabase();
    
    // Use SQLite FTS if available or standard LIKE search
    const result = await executeSql(
      db,
      `SELECT b.name as book_name, v.chapter, v.verse, v.text
       FROM ${VERSES_TABLE} v
       JOIN ${BOOKS_TABLE} b ON v.book_id = b.id
       WHERE v.text LIKE ?
       ORDER BY b.id, v.chapter, v.verse
       LIMIT ?`,
      [`%${searchText}%`, limit]
    );
    
    const verses: Scripture[] = [];
    for (let i = 0; i < result.length; i++) {
      verses.push(result[i] as Scripture);
    }
    
    return verses;
  } catch (error) {
    console.error(`Error searching verses for "${searchText}":`, error);
    return [];
  }
};

/**
 * Get all Bible books
 */
export const getAllBooks = async (): Promise<BibleBook[]> => {
  try {
    const db = await getDatabase();
    
    const result = await executeSql(
      db,
      `SELECT id, name FROM ${BOOKS_TABLE} ORDER BY id`
    );
    
    const books: BibleBook[] = [];
    for (let i = 0; i < result.length; i++) {
      books.push(result[i] as BibleBook);
    }
    
    return books;
  } catch (error) {
    console.error('Error getting all books:', error);
    return [];
  }
};

/**
 * Get number of chapters in a book
 */
export const getChapterCount = async (bookId: number): Promise<number> => {
  try {
    const db = await getDatabase();
    
    const result = await executeSql(
      db,
      `SELECT MAX(chapter) as max_chapter FROM ${VERSES_TABLE} WHERE book_id = ?`,
      [bookId]
    );
    
    if (result.length === 0) {
      return 0;
    }
    
    return result[0].max_chapter;
  } catch (error) {
    console.error(`Error getting chapter count for book ID ${bookId}:`, error);
    return 0;
  }
};

/**
 * Get verses for a specific book and chapter
 */
export const getVerses = async (
  bookId: number, 
  chapter: number
): Promise<BibleVerse[]> => {
  try {
    const db = await getDatabase();
    
    const result = await executeSql(
      db,
      `SELECT v.id, v.book_id, v.chapter, v.verse, v.text, b.name as book_name
       FROM ${VERSES_TABLE} v
       JOIN ${BOOKS_TABLE} b ON v.book_id = b.id
       WHERE v.book_id = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [bookId, chapter]
    );
    
    const verses: BibleVerse[] = [];
    for (let i = 0; i < result.length; i++) {
      verses.push(result[i] as BibleVerse);
    }
    
    return verses;
  } catch (error) {
    console.error(`Error getting verses for book ID ${bookId}, chapter ${chapter}:`, error);
    return [];
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
};

/**
 * For backward compatibility - not needed with new approach
 */
export const repairDatabase = async (): Promise<boolean> => {
  try {
    console.log('Repairing Bible database...');
    
    // Close existing connection if open
    if (dbInstance) {
      await dbInstance.closeAsync();
      dbInstance = null;
    }
    
    // Re-open database with asset source
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
      // @ts-ignore - assetSource is available in Expo SQLite v15+ but not typed
      assetSource: require('../../assets/db/KJV.db'),
      readOnly: true
    });
    
    // Verify repair was successful
    return await isDatabaseHealthy(dbInstance);
  } catch (error) {
    console.error('Database repair failed:', error);
    return false;
  }
};

/**
 * For backward compatibility - not needed with new approach
 */
export const copyDatabaseFromAssets = async (): Promise<void> => {
  console.log('Using direct asset loading instead of copying');
};
