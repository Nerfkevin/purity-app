import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

/**
 * Bible database utility functions
 */

// Constants
export const DATABASE_NAME = 'KJV.db';

// Interfaces
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
  book_name?: string;
}

export interface Scripture {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

// The database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Copies the KJV.db file from assets to app documents directory
 */
export const copyDatabaseFromAssets = async (): Promise<string> => {
  const dbDirectory = FileSystem.documentDirectory!;
  const dbPath = `${dbDirectory}${DATABASE_NAME}`;
  
  // Check if the database already exists in document directory
  const dbInfo = await FileSystem.getInfoAsync(dbPath);
  
  if (dbInfo.exists && dbInfo.size > 0) {
    return dbPath;
  }
  
  // Load the database asset - using direct require instead of variable
  const asset = Asset.fromModule(require('../assets/db/KJV.db'));
  await asset.downloadAsync();
  
  if (!asset.localUri) {
    throw new Error('Failed to get local URI for KJV database asset');
  }
  
  // Copy the asset to the app's document directory
  await FileSystem.copyAsync({
    from: asset.localUri,
    to: dbPath
  });
  
  console.log('Database extracted from asset successfully');
  return dbPath;
};

/**
 * Opens the Bible database
 */
export const openBibleDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  
  await copyDatabaseFromAssets();
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
};

/**
 * Executes a SQL query on the database
 */
export const executeSql = async (
  database: SQLite.SQLiteDatabase,
  sql: string, 
  params: any[] = []
): Promise<any[]> => {
  try {
    return await database.getAllAsync(sql, params);
  } catch (error) {
    console.error('SQL Error:', sql, params, error);
    throw error;
  }
};

/**
 * Verifies database integrity by checking for required tables and data
 */
export const verifyDatabaseIntegrity = async (database: SQLite.SQLiteDatabase): Promise<boolean> => {
  try {
    // Check if tables exist using the executeSql helper
    const tables = await executeSql(
      database,
      "SELECT name FROM sqlite_master WHERE type='table' AND (name='KJV_books' OR name='KJV_verses')"
    );
    
    if (tables.length < 2) {
      console.error('Required tables not found');
      return false;
    }
    
    // Check if books table has data
    const booksCountResult = await executeSql(
      database,
      "SELECT COUNT(*) as count FROM KJV_books"
    );
    
    const booksCount = booksCountResult[0]?.count || 0;
    if (booksCount < 66) {
      console.error('Books table incomplete');
      return false;
    }
    
    // Check if verses table has data
    const versesCountResult = await executeSql(
      database,
      "SELECT COUNT(*) as count FROM KJV_verses"
    );
    
    const versesCount = versesCountResult[0]?.count || 0;
    if (versesCount < 30000) {
      console.error('Verses table incomplete');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying database:', error);
    return false;
  }
};

/**
 * Closes the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

/**
 * For compatibility with code that calls populateFromAsset
 */
export const populateFromAsset = async (): Promise<boolean> => {
  try {
    await copyDatabaseFromAssets();
    const database = await openBibleDatabase();
    return await verifyDatabaseIntegrity(database);
  } catch (error) {
    console.error('Error populating database from asset:', error);
    return false;
  }
}; 