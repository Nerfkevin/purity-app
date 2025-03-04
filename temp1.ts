import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import { dailyScriptures, emergencyScriptures, getRandomScripture, ScriptureVerse } from './scriptureLists';
import { openDatabase, Database, executeSql, executeBatch } from './databaseUtils';
import * as SQLite from 'expo-sqlite';

// Define custom SQLite types we need
type SQLiteTransaction = any;
type SQLiteResultSet = any;
type SQLiteError = any;

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

// Add these types to help with database structure detection
export interface DatabaseTableInfo {
  name: string;
}

export interface DatabaseTableSchema {
  name: string;
  columns: string[];
}

export interface DetectedDatabaseStructure {
  booksTable: string | null;
  versesTable: string | null;
  translation: string | null;
}

const DATABASE_NAME = 'purity.db';
const DATABASE_ASSET_PATH = 'assets/db/KJV.db';

let db: Database | null = null;

// Define essential verses for fallback when full database can't be loaded
const essentialVerses = [
  // Genesis key passages
  { id: 101, book_id: 1, chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.' },
  // John 3:16 - most known verse
  { id: 126, book_id: 43, chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
  // Romans salvation
  { id: 128, book_id: 45, chapter: 3, verse: 23, text: 'For all have sinned, and come short of the glory of God;' },
  { id: 130, book_id: 45, chapter: 6, verse: 23, text: 'For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.' },
  // Psalm 23
  { id: 108, book_id: 19, chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
  // Isaiah 53:5
  { id: 115, book_id: 23, chapter: 53, verse: 5, text: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.' },
  // Philippians 4:13
  { id: 136, book_id: 50, chapter: 4, verse: 13, text: 'I can do all things through Christ which strengtheneth me.' },
  // Proverbs 3:5-6
  { id: 112, book_id: 20, chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
  { id: 113, book_id: 20, chapter: 3, verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
  // Matthew 28:19-20
  { id: 123, book_id: 40, chapter: 28, verse: 19, text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:' },
];

// Add these declarations near the top of the file, after imports
const tempDbPath = `${(FileSystem as any).documentDirectory}raw_extract_temp.db`;
const tempDbName = 'raw_extract_temp.db';

// Main function to get database instance
export async function getDatabase(): Promise<Database> {
  try {
    if (db) {
      return db;
    }
    
    // Open the database using our compatibility layer
    db = await openDatabase(DATABASE_NAME);
    
    console.log('Database opened successfully');
    
    // Initialize tables
    if (db) {
      await initDatabase(db);
      
      // Check if database is populated
      const populated = await isDatabasePopulated();
      if (!populated) {
        console.log('Database not populated, populating now...');
        await populateFromAsset();
      } else {
        console.log('Database already populated, skipping population.');
      }
    }
    
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

// Initialize the database tables
const initDatabase = async (db: Database): Promise<void> => {
  try {
    // Create books table
    await executeSql(db, `
      CREATE TABLE IF NOT EXISTS kjv_books (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    
    // Create verses table
    await executeSql(db, `
      CREATE TABLE IF NOT EXISTS kjv_verses (
        id INTEGER PRIMARY KEY,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES kjv_books (id)
      )
    `);
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Check if database is populated
export const isDatabasePopulated = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();
    const result = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_books');
    const count = result.rows._array[0]?.count || 0;
    return count > 0;
  } catch (error) {
    console.error('Error checking if database is populated:', error);
    return false;
  }
};

/**
 * Count the total number of verses in the database
 */
export const getVersesCount = async (): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await executeSql(
      db,
      `SELECT COUNT(*) as count FROM kjv_verses`,
      []
    );
    
    if (result.rows.length > 0) {
      return result.rows._array[0].count;
    }
    return 0;
  } catch (error) {
    console.error('Error counting verses:', error);
    return 0;
  }
};

/**
 * Get standard verse count for a chapter based on the book and chapter number
 */
export const getStandardVerseCount = (bookId: number, chapter: number): number => {
  // Notable chapters with special verse counts
  const specialChapters: Record<string, number> = {
    // Genesis
    '1-1': 31, // Genesis 1 has 31 verses
    '1-2': 25, // Genesis 2 has 25 verses
    // Psalms
    '19-119': 176, // Psalm 119 has 176 verses (longest chapter)
    '19-117': 2,   // Psalm 117 has 2 verses (shortest chapter)
    // John
    '43-3': 36,    // John 3 has 36 verses (includes John 3:16)
    // Revelation
    '66-22': 21,   // Revelation 22 has 21 verses
  };

  const key = `${bookId}-${chapter}`;
  if (specialChapters[key]) {
    return specialChapters[key];
  }

  // Default verse counts based on typical chapter lengths
  switch (bookId) {
    case 19: // Psalms - generally longer chapters
      return 25;
    case 20: // Proverbs
    case 23: // Isaiah
      return 22;
    case 66: // Revelation
      return 20;
    default:
      return 30; // Default average chapter length
  }
};

// Type-safe access to rows from SQLite results
const getRowsData = (results: SQLiteResultSet): any[] => {
  if (results.rows && results.rows._array) {
    return results.rows._array;
  } else if (results.rows && typeof results.rows.item === 'function') {
    const data = [];
    for (let i = 0; i < results.rows.length; i++) {
      data.push(results.rows.item(i));
    }
    return data;
  } else if (results.rows) {
    return Array.from(results.rows as any);
  }
  return [];
};

// This function detects the database structure dynamically
export const detectDatabaseStructure = async (db: Database): Promise<DetectedDatabaseStructure> => {
  try {
    console.log('Detecting database structure...');
    // Get all tables in the database - use a more robust query that works across all SQLite versions
    const tableListQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%'";
    
    // We'll add additional debugging and robustness
    let tableResults;
    try {
      tableResults = await executeSql(db, tableListQuery, []);
      console.log('Raw table results:', JSON.stringify(tableResults));
    } catch (error) {
      console.error('Error executing table list query:', error);
      throw new Error('Failed to query database tables');
    }
    
    // Use our helper for consistent access to rows
    const tableData = getRowsData(tableResults);
    const tables: string[] = tableData.map(row => row.name).filter(Boolean);
    
    console.log('Tables found in database:', tables);
    
    // If we don't find any tables, try an alternative approach
    if (tables.length === 0) {
      console.log('No tables found with standard query, trying alternative approaches...');
      
      // Try a different query for SQLite databases
      try {
        const altTableResults = await executeSql(db, "SELECT tbl_name FROM sqlite_master WHERE type='table'", []);
        const altTableData = getRowsData(altTableResults);
        
        for (const row of altTableData) {
          if (row.tbl_name && !tables.includes(row.tbl_name)) {
            tables.push(row.tbl_name);
          }
        }
        
        console.log('Tables found with alternative query:', tables);
      } catch (altError) {
        console.error('Error with alternative table query:', altError);
      }
      
      // If we still don't have tables, try brute force approach by checking for expected tables directly
      if (tables.length === 0) {
        console.log('Still no tables found, trying direct table existence checks...');
        
        // Try some common Bible database table patterns
        const commonPrefixes = ['kjv', 'bible', 'asv', 'niv', 'esv', ''];
        
        for (const prefix of commonPrefixes) {
          const prefixWithUnderscore = prefix ? `${prefix}_` : '';
          
          try {
            // Check if books table exists
            const booksTableName = `${prefixWithUnderscore}books`;
            const bookCheckResult = await executeSql(
              db, 
              `SELECT 1 FROM ${booksTableName} LIMIT 1`,
              []
            ).catch(() => null);
            
            if (bookCheckResult) {
              console.log(`Found books table: ${booksTableName}`);
              tables.push(booksTableName);
            }
          } catch (e) {
            // Table doesn't exist, continue checking
          }
          
          try {
            // Check if verses table exists
            const versesTableName = `${prefixWithUnderscore}verses`;
            const verseCheckResult = await executeSql(
              db,
              `SELECT 1 FROM ${versesTableName} LIMIT 1`,
              []
            ).catch(() => null);
            
            if (verseCheckResult) {
              console.log(`Found verses table: ${versesTableName}`);
              tables.push(versesTableName);
            }
          } catch (e) {
            // Table doesn't exist, continue checking
          }
        }
      }
    }
    
    // Check table structure for each potential Bible books table
    let booksTable: string | null = null;
    let versesTable: string | null = null;
    let translation: string | null = null;
    
    // First try to identify using the <translation>_books and <translation>_verses pattern
    for (const table of tables) {
      if (table.endsWith('_books')) {
        const potentialTranslation = table.replace('_books', '');
        const potentialVersesTable = `${potentialTranslation}_verses`;
        
        if (tables.includes(potentialVersesTable)) {
          booksTable = table;
          versesTable = potentialVersesTable;
          translation = potentialTranslation;
          break;
        }
      }
    }
    
    // If we couldn't find matching tables, try more lenient matching
    if (!booksTable || !versesTable) {
      // Find any table with "book" in the name
      const booksTables = tables.filter(t => t.includes('book'));
      if (booksTables.length > 0) {
        booksTable = booksTables[0];
      }
      
      // Find any table with "verse" in the name
      const versesTables = tables.filter(t => t.includes('verse'));
      if (versesTables.length > 0) {
        versesTable = versesTables[0];
      }
      
      // Extract translation from either table
      if (booksTable && booksTable.includes('_')) {
        translation = booksTable.split('_')[0];
      } else if (versesTable && versesTable.includes('_')) {
        translation = versesTable.split('_')[0];
      } else {
        translation = 'kjv'; // Default to KJV if we can't detect
      }
    }
    
    // If we still couldn't find the tables, try direct schema analysis
    if (!booksTable || !versesTable) {
      console.log('Could not identify tables by name, attempting schema analysis...');
      
      for (const table of tables) {
        try {
          // Get table schema
          const schemaQuery = `PRAGMA table_info(${table})`;
          const schemaResults = await executeSql(db, schemaQuery, []);
          
          const columns: string[] = [];
          if (schemaResults.rows && schemaResults.rows._array) {
            for (let i = 0; i < schemaResults.rows._array.length; i++) {
              columns.push(schemaResults.rows._array[i].name);
            }
          } else if (schemaResults.rows && schemaResults.rows.item) {
            for (let i = 0; i < schemaResults.rows.length; i++) {
              columns.push(schemaResults.rows.item(i).name);
            }
          }
          
          console.log(`Table ${table} has columns:`, columns);
          
          // Check if this is likely a books table
          if (!booksTable && 
              columns.includes('id') && 
              columns.includes('name') &&
              columns.length <= 5) { // Books tables are typically simple
            booksTable = table;
            console.log(`Identified ${table} as likely books table`);
          }
          
          // Check if this is likely a verses table
          if (!versesTable && 
              columns.includes('book_id') && 
              columns.includes('chapter') && 
              columns.includes('verse') && 
              columns.includes('text')) {
            versesTable = table;
            console.log(`Identified ${table} as likely verses table`);
          }
        } catch (error) {
          console.error(`Error analyzing schema for table ${table}:`, error);
        }
      }
    }
    
    // If we found a structure, return it
    if (booksTable && versesTable) {
      console.log(`Identified database structure: translation=${translation}, books=${booksTable}, verses=${versesTable}`);
      return { booksTable, versesTable, translation };
    }
    
    // If we couldn't find any tables, give up and use our defaults
    console.log('Could not identify book or verse tables in database');
    return { 
      booksTable: 'kjv_books', 
      versesTable: 'kjv_verses', 
      translation: 'kjv' 
    };
    
  } catch (error) {
    console.error('Error detecting database structure:', error);
    // Default to standard KJV tables as fallback
    return { 
      booksTable: 'kjv_books', 
      versesTable: 'kjv_verses', 
      translation: 'kjv' 
    };
  }
};

// Updated function to handle direct data insertion when needed
export const insertDirectBibleData = async (): Promise<boolean> => {
  try {
    console.log('Inserting direct Bible data...');
    const db = await getDatabase();
    
    // Create our standard tables if they don't exist
    await createBibleTables(db);
    
    // Insert default books
    await insertCompleteBibleBooks(db);
    
    // Insert at least essential verses to ensure basic functionality
    await insertEssentialVerses(db);
    
    // Success
    console.log('Successfully inserted direct Bible data');
    return true;
  } catch (error) {
    console.error('Error inserting direct Bible data:', error);
    return false;
  }
};

// Helper function to extract database from raw KJV database file
export const extractRawDatabaseData = async (): Promise<boolean> => {
  try {
    console.log('Attempting raw database extraction...');
    const fileSystem = FileSystem as any;
    const asset = Asset.fromModule(require('../assets/KJV.db'));
    await asset.downloadAsync();
    
    const tempPath = `${fileSystem.documentDirectory}raw_extract_temp.db`;
    console.log(`Copying asset to ${tempPath}...`);
    
    // Copy the asset to a temporary file
    await fileSystem.copyAsync({
      from: asset.localUri!,
      to: tempPath
    });
    
    // Try to open it with different approaches
    let tempDb: Database | null = null;
    try {
      // Use the platform-specific approach to open database
      if (Platform.OS === 'ios') {
        tempDb = await openDatabase(tempDbPath);
      } else {
        // For Android
        tempDb = await openDatabase(tempDbName);
      }
      console.log('Successfully opened database with SQLite.openDatabase');
    } catch (error) {
      console.error('Error opening database with SQLite.openDatabase:', error);
      return false;
    }
    
    // Identify tables with a direct query to get bytes from the file
    try {
      console.log('Analyzing database file structure...');
      // Use a simple query to verify the database is usable
      const tableCheckQuery = "SELECT name FROM sqlite_master WHERE type='table' LIMIT 10";
      const tableResults = await executeSql(tempDb!, tableCheckQuery, []);
      
      const tableData = getRowsData(tableResults);
      const tables = tableData.map(row => row.name).filter(Boolean);
      
      console.log('Raw extraction found tables:', tables);
      
      // Close the database
      if (tempDb) {
        await tempDb.closeAsync();
      }
      
      // Clean up the temporary file
      await fileSystem.deleteAsync(tempPath, { idempotent: true });
      
      // Success if we found tables
      return tables.length > 0;
    } catch (error) {
      console.error('Error analyzing database file structure:', error);
      
      // Clean up
      if (tempDb) {
        try {
          await tempDb.closeAsync();
        } catch (e) {}
      }
      await fileSystem.deleteAsync(tempPath, { idempotent: true });
      
      return false;
    }
  } catch (error) {
    console.error('Error in raw database extraction:', error);
    return false;
  }
};

// Completely updated function to populate database from asset with better error handling
export const populateFromAsset = async (): Promise<boolean> => {
  console.log('Starting to populate database from asset...');
  let tempDb: Database | null = null;
  let mainDb: Database | null = null;
  
  try {
    // Get paths for the database files
    const fileSystem = FileSystem as any;
    const documentsDir = fileSystem.documentDirectory;
    
    // Asset names and paths
    const tempDbName = 'KJV_temp.db';
    const tempDbPath = `${documentsDir}${tempDbName}`;
    
    console.log('Opening temp database...');
    
    // Get the asset module ID
    const asset = Asset.fromModule(require('../assets/KJV.db'));
    await asset.downloadAsync();
    
    console.log(`Asset URI: ${asset.localUri}`);
    
    // Copy the asset to a temporary file
    console.log(`Copying asset to ${tempDbPath}...`);
    await fileSystem.copyAsync({
      from: asset.localUri!,
      to: tempDbPath
    });
    
    // Try several approaches to open the database
    try {
      // Use platform-specific approach
      if (Platform.OS === 'ios') {
        tempDb = await openDatabase(tempDbPath);
      } else {
        // For Android
        tempDb = await openDatabase(tempDbName);
      }
      console.log('Database opened successfully');
    } catch (openError) {
      console.error('Error opening database with standard method:', openError);
      
      // Try alternative approach
      console.log('Trying alternative database opening approach...');
      try {
        // Fallback for iOS
        if (Platform.OS === 'ios') {
          // Cast as SQLite.WebSQLDatabase to satisfy TypeScript - using legacy callback API
          tempDb = await openDatabase(
            tempDbPath,
            '1.0',
            '',
            1,
            () => console.log('Database opened successfully with callback'),
            (error: any) => {
              console.error('Error opening database with callback:', error);
              throw error;
            }
          );
        } else {
          // Fallback for Android
          tempDb = await openDatabase(
            tempDbPath.split('/').pop() || tempDbName
          );
        }
      } catch (altOpenError) {
        console.error('Error with alternative database opening:', altOpenError);
        throw new Error('Could not open the KJV database asset');
      }
    }
    
    // Ensure we have a valid database object
    if (!tempDb) {
      throw new Error('Failed to open database');
    }
    
    // Detect the structure of the asset database
    const structure = await detectDatabaseStructure(tempDb);
    
    if (!structure.booksTable || !structure.versesTable) {
      console.error('Could not identify book or verse tables in KJV database');
      
      // Try raw extraction as a last resort
      const extractionSuccessful = await extractRawDatabaseData();
      if (!extractionSuccessful) {
        throw new Error('Unknown KJV database structure');
      }
    }
    
    // Now we know the table names (or have defaults), open the main database
    mainDb = await getDatabase();
    
    // Create our target tables
    await createBibleTables(mainDb);
    
    // Check if the source database has any data
    let hasData = false;
    
    try {
      // Try to count books
      const booksCountQuery = `SELECT COUNT(*) as count FROM ${structure.booksTable}`;
      const booksCountResult = await executeSql(tempDb, booksCountQuery, []);
      const booksCount = booksCountResult.rows.item(0).count;
      console.log(`Found ${booksCount} books in source database`);
      
      hasData = booksCount > 0;
    } catch (countError) {
      console.error('Error counting books in source database:', countError);
      hasData = false;
    }
    
    if (!hasData) {
      console.log('Source database has no data, falling back to inserting essential data...');
      
      // Count verses to confirm
      const versesCount = await getVersesCount();
      console.log(`Only ${versesCount} verses found in database, inserting essential verses...`);
      
      // Insert complete books list
      await insertCompleteBibleBooks(mainDb);
      
      // Insert essential verses
      console.log(`Inserting ${essentialVerses.length} essential verses...`);
      await insertEssentialVerses(mainDb);
      console.log('Inserted essential verses');
      
      // Clean up
      if (tempDb) {
        try {
          await tempDb.closeAsync();
        } catch (e) {}
      }
      
      await fileSystem.deleteAsync(tempDbPath, { idempotent: true });
      console.log('Database population complete');
      return true;
    }
    
    // Import books
    console.log(`Importing books from ${structure.booksTable}...`);
    try {
      const booksQuery = `SELECT * FROM ${structure.booksTable}`;
      const booksResults = await executeSql(tempDb, booksQuery, []);
      
      // Batch insert books
      const booksCount = booksResults.rows.length;
      console.log(`Importing ${booksCount} books...`);
      
      // Use a transaction for better performance
      await new Promise<void>((resolve, reject) => {
        mainDb!.transaction(
          (tx: SQLiteTransaction) => {
            tx.executeSql('DELETE FROM kjv_books'); // Clear existing books
            
            for (let i = 0; i < booksCount; i++) {
              const book = booksResults.rows.item(i);
              tx.executeSql(
                'INSERT INTO kjv_books (id, name) VALUES (?, ?)',
                [book.id, book.name]
              );
            }
          },
          (error) => {
            console.error('Error importing books:', error);
            reject(error);
          },
          () => {
            console.log('Books import completed successfully');
            resolve();
          }
        );
      });
    } catch (booksError) {
      console.error('Error importing books:', booksError);
      // Fall back to inserting standard books
      await insertCompleteBibleBooks(mainDb);
    }
    
    // Import verses in batches to prevent memory issues
    try {
      console.log(`Importing verses from ${structure.versesTable}...`);
      const batchSize = 1000;
      let importedVerses = 0;
      let hasMoreVerses = true;
      let offset = 0;
      
      // First count total verses to provide progress updates
      let totalVerses = 0;
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${structure.versesTable}`;
        const countResult = await executeSql(tempDb, countQuery, []);
        totalVerses = countResult.rows.item(0).count;
        console.log(`Found ${totalVerses} verses to import`);
      } catch (countError) {
        console.error('Error counting verses:', countError);
        totalVerses = 31102; // Standard KJV verse count as fallback
      }
      
      // Clear existing verses
      await executeSql(mainDb, 'DELETE FROM kjv_verses', []);
      
      // Import in batches
      while (hasMoreVerses) {
        try {
          const versesQuery = `SELECT * FROM ${structure.versesTable} LIMIT ${batchSize} OFFSET ${offset}`;
          const versesResults = await executeSql(tempDb, versesQuery, []);
          
          const versesCount = versesResults.rows.length;
          if (versesCount === 0) {
            hasMoreVerses = false;
            break;
          }
          
          // Use a transaction for better performance
          await new Promise<void>((resolve, reject) => {
            mainDb!.transaction(
              (tx: SQLiteTransaction) => {
                for (let i = 0; i < versesCount; i++) {
                  const verse = versesResults.rows.item(i);
                  tx.executeSql(
                    'INSERT INTO kjv_verses (id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)',
                    [verse.id, verse.book_id, verse.chapter, verse.verse, verse.text]
                  );
                }
              },
              (error) => {
                console.error(`Error importing verses batch (offset=${offset}):`, error);
                reject(error);
              },
              () => {
                importedVerses += versesCount;
                console.log(`Imported verses: ${importedVerses}/${totalVerses} (${Math.round(importedVerses/totalVerses*100)}%)`);
                resolve();
              }
            );
          });
          
          offset += batchSize;
        } catch (batchError) {
          console.error(`Error in verse batch import at offset ${offset}:`, batchError);
          // If we fail part way through, at least we imported some verses
          hasMoreVerses = false;
        }
      }
      
      console.log('Verses import completed successfully');
    } catch (versesError) {
      console.error('Error importing verses:', versesError);
      // Fall back to inserting essential verses
      console.log('Falling back to inserting essential verses...');
      await insertEssentialVerses(mainDb);
    }
    
    // Clean up the temporary database
    if (tempDb) {
      try {
        await tempDb.closeAsync();
      } catch (e) {}
    }
    
    await fileSystem.deleteAsync(tempDbPath, { idempotent: true });
    
    console.log('Database population completed successfully');
    return true;
    
  } catch (error) {
    console.error('Error populating database from asset:', error);
    
    // Fall back to inserting essential data
    console.log('Falling back to inserting essential data...');
    try {
      if (mainDb) {
        await createBibleTables(mainDb);
        await insertCompleteBibleBooks(mainDb);
        await insertEssentialVerses(mainDb);
        console.log('Database population complete with essential data');
        return true;
      } else {
        const db = await getDatabase();
        await createBibleTables(db);
        await insertCompleteBibleBooks(db);
        await insertEssentialVerses(db);
        console.log('Database population complete with essential data');
        return true;
      }
    } catch (fallbackError) {
      console.error('Error in fallback population:', fallbackError);
      return false;
    }
  } finally {
    // Ensure databases are closed
    if (tempDb) {
      try {
        await tempDb.closeAsync();
      } catch (e) {}
    }
  }
};

// Helper function to create database tables
export const createBibleTables = async (db: Database): Promise<void> => {
  try {
    // Create the books table
    await executeSql(
      db,
      `CREATE TABLE IF NOT EXISTS kjv_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      )`,
      []
    );
    
    // Create the verses table
    await executeSql(
      db,
      `CREATE TABLE IF NOT EXISTS kjv_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER,
        chapter INTEGER,
        verse INTEGER,
        text TEXT,
        FOREIGN KEY (book_id) REFERENCES kjv_books(id)
      )`,
      []
    );
    
    // Create indexes for better performance
    await executeSql(
      db,
      `CREATE INDEX IF NOT EXISTS idx_verses_book_chapter_verse ON kjv_verses (book_id, chapter, verse)`,
      []
    );
    
    await executeSql(
      db,
      `CREATE VIRTUAL TABLE IF NOT EXISTS kjv_verses_fts USING fts5(
        id, book_id, chapter, verse, text,
        content='kjv_verses', content_rowid='id'
      )`,
      []
    );
    
    // Create trigger to keep FTS table in sync with verses
    await executeSql(
      db,
      `CREATE TRIGGER IF NOT EXISTS kjv_verses_ai AFTER INSERT ON kjv_verses BEGIN
        INSERT INTO kjv_verses_fts(id, book_id, chapter, verse, text) 
        VALUES (new.id, new.book_id, new.chapter, new.verse, new.text);
      END;`,
      []
    );
    
    await executeSql(
      db,
      `CREATE TRIGGER IF NOT EXISTS kjv_verses_ad AFTER DELETE ON kjv_verses BEGIN
        INSERT INTO kjv_verses_fts(kjv_verses_fts, id, book_id, chapter, verse, text) 
        VALUES('delete', old.id, old.book_id, old.chapter, old.verse, old.text);
      END;`,
      []
    );
    
    await executeSql(
      db,
