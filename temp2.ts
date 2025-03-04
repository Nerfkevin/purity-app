    }
    
    const [, book, chapter, verse] = match;
    const chapterNum = parseInt(chapter, 10);
    const verseNum = parseInt(verse, 10);
    
    if (isNaN(chapterNum) || isNaN(verseNum)) {
      console.error(`Invalid chapter or verse number: ${reference}`);
      return null;
    }
    
    return await getVerse(book, chapterNum, verseNum);
  } catch (error) {
    console.error('Error parsing verse reference:', error);
    return null;
  }
};

// Search for verses containing the search text
export const searchVerses = async (searchText: string, limit: number = 20): Promise<Scripture[]> => {
  try {
    if (!searchText || searchText.length < 2) {
      console.error('Search text is too short');
      return [];
    }
    
    const db = await getDatabase();
    
    // Use a more flexible search with wildcards and LOWER for case-insensitive search
    const result = await executeSql(
      db,
      `SELECT b.name as book_name, v.chapter, v.verse, v.text
       FROM kjv_verses v
       JOIN kjv_books b ON v.book_id = b.id
       WHERE LOWER(v.text) LIKE LOWER(?)
       ORDER BY b.id, v.chapter, v.verse
       LIMIT ?`,
      [`%${searchText}%`, limit]
    );
    
    if (result.rows.length === 0) {
      console.log(`No verses found for search: "${searchText}". Checking if we can use a reference lookup instead.`);
      
      // Try to see if the search text might be a reference
      if (/^[a-zA-Z0-9\s]+\s+\d+:\d+$/.test(searchText)) {
        const verseByRef = await getVerseByReference(searchText);
        return verseByRef ? [verseByRef] : [];
      }
      
      // If we still can't find anything, check our emergency verses
      const matchingEmergency = emergencyScriptures.find(v => 
        v.text.toLowerCase().includes(searchText.toLowerCase())
      );
      
      if (matchingEmergency) {
        return [{
          book_name: matchingEmergency.book,
          chapter: matchingEmergency.chapter,
          verse: matchingEmergency.verse,
          text: matchingEmergency.text
        }];
      }
      
      return [];
    }
    
    return result.rows._array as Scripture[];
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
};

// Alias for searchVerses for backward compatibility
export const searchBible = searchVerses;

// Get a daily scripture (for today)
export const getDailyScripture = async (): Promise<Scripture | null> => {
  // Get today's date and use it to select a scripture
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Get a scripture reference based on the day of the year (cycling)
  const scriptureObj = dailyScriptures[dayOfYear % dailyScriptures.length];
  
  // Use the scripture object to get the verse from database
  return getVerse(scriptureObj.book, scriptureObj.chapter, scriptureObj.verse);
};

// Get an emergency scripture
export const getEmergencyScripture = async (): Promise<Scripture | null> => {
  // Get a random emergency scripture reference
  const scriptureObj = getRandomScripture(emergencyScriptures);
  
  // Use the scripture object to get the verse from database
  if (scriptureObj) {
    return getVerse(scriptureObj.book, scriptureObj.chapter, scriptureObj.verse);
  }
  
  return null;
};

// Get all Bible books
export const getAllBooks = async (): Promise<BibleBook[]> => {
  try {
    const db = await getDatabase();
    
    // Log debug information
    console.log('Getting all books from database...');
    
    const result = await executeSql(
      db,
      `SELECT id, name FROM kjv_books ORDER BY id`,
      []
    );
    
    if (result.rows.length === 0) {
      console.log('No books found in database. Checking if database needs initialization...');
      // Try to repopulate
      const populated = await isDatabasePopulated();
      if (!populated) {
        console.log('Database not populated, attempting to populate again...');
        await populateFromAsset();
        
        // Try again after populating
        const retryResult = await executeSql(
          db,
          `SELECT id, name FROM kjv_books ORDER BY id`,
          []
        );
        
        console.log(`Found ${retryResult.rows.length} books after repopulation`);
        return retryResult.rows._array as BibleBook[];
      }
      
      return [];
    }
    
    console.log(`Found ${result.rows.length} books in database`);
    return result.rows._array as BibleBook[];
  } catch (error) {
    console.error('Error getting all books:', error);
    // Return a set of default books if database fails
    console.log('Returning default book list due to error');
    return [
      { id: 1, name: 'Genesis' },
      { id: 2, name: 'Exodus' },
      { id: 19, name: 'Psalms' },
      { id: 20, name: 'Proverbs' },
      { id: 40, name: 'Matthew' },
      { id: 41, name: 'Mark' },
      { id: 42, name: 'Luke' },
      { id: 43, name: 'John' },
      { id: 45, name: 'Romans' },
      { id: 49, name: 'Ephesians' },
      { id: 66, name: 'Revelation' }
    ];
  }
};

/**
 * Helper function to get standard chapter counts for Bible books
 */
export const getStandardChapterCount = (bookId: number): number => {
  // Standard chapter counts for each book in the Bible
  const standardChapterCounts: Record<number, number> = {
    1: 50,  // Genesis
    2: 40,  // Exodus
    3: 27,  // Leviticus
    4: 36,  // Numbers
    5: 34,  // Deuteronomy
    6: 24,  // Joshua
    7: 21,  // Judges
    8: 4,   // Ruth
    9: 31,  // 1 Samuel
    10: 24, // 2 Samuel
    11: 22, // 1 Kings
    12: 25, // 2 Kings
    13: 29, // 1 Chronicles
    14: 36, // 2 Chronicles
    15: 10, // Ezra
    16: 13, // Nehemiah
    17: 10, // Esther
    18: 42, // Job
    19: 150, // Psalms
    20: 31, // Proverbs
    21: 12, // Ecclesiastes
    22: 8,  // Song of Solomon
    23: 66, // Isaiah
    24: 52, // Jeremiah
    25: 5,  // Lamentations
    26: 48, // Ezekiel
    27: 12, // Daniel
    28: 14, // Hosea
    29: 3,  // Joel
    30: 9,  // Amos
    31: 1,  // Obadiah
    32: 4,  // Jonah
    33: 7,  // Micah
    34: 3,  // Nahum
    35: 3,  // Habakkuk
    36: 3,  // Zephaniah
    37: 2,  // Haggai
    38: 14, // Zechariah
    39: 4,  // Malachi
    40: 28, // Matthew
    41: 16, // Mark
    42: 24, // Luke
    43: 21, // John
    44: 28, // Acts
    45: 16, // Romans
    46: 16, // 1 Corinthians
    47: 13, // 2 Corinthians
    48: 6,  // Galatians
    49: 6,  // Ephesians
    50: 4,  // Philippians
    51: 4,  // Colossians
    52: 5,  // 1 Thessalonians
    53: 3,  // 2 Thessalonians
    54: 6,  // 1 Timothy
    55: 4,  // 2 Timothy
    56: 3,  // Titus
    57: 1,  // Philemon
    58: 13, // Hebrews
    59: 5,  // James
    60: 5,  // 1 Peter
    61: 3,  // 2 Peter
    62: 5,  // 1 John
    63: 1,  // 2 John
    64: 1,  // 3 John
    65: 1,  // Jude
    66: 22, // Revelation
  };

  return standardChapterCounts[bookId] || 1; // Default to 1 chapter if not found
};

/**
 * Get chapter count for a book
 */
export const getChapterCount = async (bookId: number): Promise<number> => {
  try {
    console.log(`Getting chapter count for book ID ${bookId}`);
    const db = await getDatabase();
    const result = await executeSql(
      db,
      `SELECT MAX(chapter) as max_chapter FROM kjv_verses WHERE book_id = ?`,
      [bookId]
    );

    if (result.rows.length > 0 && result.rows._array[0].max_chapter) {
      const chapterCount = result.rows._array[0].max_chapter;
      console.log(`Found ${chapterCount} chapters for book ID ${bookId}`);
      return chapterCount;
    }

    // If no chapters found, check if we need to populate the database
    const versesCount = await getVersesCount();
    if (versesCount < 100) {
      console.log(`Found only ${versesCount} verses, attempting to populate from KJV asset`);
      await populateFromAsset();
      
      // Try again after populating
      const retryResult = await executeSql(
        db,
        `SELECT MAX(chapter) as max_chapter FROM kjv_verses WHERE book_id = ?`,
        [bookId]
      );

      if (retryResult.rows.length > 0 && retryResult.rows._array[0].max_chapter) {
        const chapterCount = retryResult.rows._array[0].max_chapter;
        console.log(`Found ${chapterCount} chapters for book ID ${bookId} after populating`);
        return chapterCount;
      }
    }

    // If still no chapters, use standard chapter count
    const standardChapterCount = getStandardChapterCount(bookId);
    console.log(`Using standard chapter count for book ID ${bookId}: ${standardChapterCount}`);
    return standardChapterCount;
  } catch (error) {
    console.error(`Error getting chapter count for book ID ${bookId}:`, error);
    const standardChapterCount = getStandardChapterCount(bookId);
    console.log(`Using standard chapter count due to error for book ID ${bookId}: ${standardChapterCount}`);
    return standardChapterCount;
  }
};

// Get verses for a specific book and chapter (and optionally verse)
export const getVerses = async (bookId: number, chapter: number, verse?: number): Promise<BibleVerse[]> => {
  try {
    const db = await getDatabase();
    
    console.log(`Getting verses for book ID ${bookId}, chapter ${chapter}${verse ? `, verse ${verse}` : ''}`);
    
    // Get the book name first, we'll need it for placeholders
    const bookResult = await executeSql(
      db,
      `SELECT name FROM kjv_books WHERE id = ?`,
      [bookId]
    );
    
    const bookName = bookResult.rows.length > 0 
      ? bookResult.rows._array[0]?.name 
      : `Book ${bookId}`;
    
    // If verse is specified, get only that verse, otherwise get all verses in the chapter
    if (verse !== undefined) {
      const result = await executeSql(
        db,
        `SELECT v.id, v.book_id, v.chapter, v.verse, v.text, b.name as book_name
         FROM kjv_verses v
         JOIN kjv_books b ON v.book_id = b.id
         WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ?
         ORDER BY v.verse`,
        [bookId, chapter, verse]
      );
      
      if (result.rows.length === 0) {
        console.log(`Verse not found: Book ID ${bookId}, Chapter ${chapter}, Verse ${verse}. Checking if database needs population...`);
        
        // Check if we have verses in the database at all
        const versesCount = await getVersesCount();
        
        // If we have very few verses, try to populate from KJV asset
        if (versesCount < 1000) {
          console.log(`Only ${versesCount} verses in database, attempting to populate from KJV asset...`);
          await populateFromAsset();
          
          // Try again after populating
          const retryResult = await executeSql(
            db,
            `SELECT v.id, v.book_id, v.chapter, v.verse, v.text, b.name as book_name
             FROM kjv_verses v
             JOIN kjv_books b ON v.book_id = b.id
             WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ?
             ORDER BY v.verse`,
            [bookId, chapter, verse]
          );
          
          if (retryResult.rows.length > 0) {
            console.log(`Verse found after database population`);
            return retryResult.rows._array as BibleVerse[];
          }
        }
        
        // Still not found, use placeholder
        console.log(`Verse not available after population attempts. Using placeholder.`);
        return [{
          id: -1,
          book_id: bookId,
          chapter: chapter,
          verse: verse,
          text: `This verse (${bookName} ${chapter}:${verse}) is not available in the current database. The full KJV Bible contains this verse.`,
          book_name: bookName
        }];
      }
      
      console.log(`Found ${result.rows.length} verses matching criteria`);
      return result.rows._array as BibleVerse[];
    }
    
    // No specific verse requested, get all verses in the chapter
    const result = await executeSql(
      db,
      `SELECT v.id, v.book_id, v.chapter, v.verse, v.text, b.name as book_name
       FROM kjv_verses v
       JOIN kjv_books b ON v.book_id = b.id
       WHERE v.book_id = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [bookId, chapter]
    );
    
    if (result.rows.length === 0) {
      console.log(`Chapter not found: Book ID ${bookId}, Chapter ${chapter}. Checking if database needs population...`);
      
      // Check if we have enough verses in the database
      const versesCount = await getVersesCount();
      
      // If we have very few verses, try to populate from KJV asset
      if (versesCount < 1000) {
        console.log(`Only ${versesCount} verses in database, attempting to populate from KJV asset...`);
        await populateFromAsset();
        
        // Try again after populating
        const retryResult = await executeSql(
          db,
          `SELECT v.id, v.book_id, v.chapter, v.verse, v.text, b.name as book_name
           FROM kjv_verses v
           JOIN kjv_books b ON v.book_id = b.id
           WHERE v.book_id = ? AND v.chapter = ?
           ORDER BY v.verse`,
          [bookId, chapter]
        );
        
        if (retryResult.rows.length > 0) {
          console.log(`Found ${retryResult.rows.length} verses in chapter after database population`);
          return retryResult.rows._array as BibleVerse[];
        }
      }
      
      // Still not found, use placeholder verses
      console.log(`Chapter not found: Book ID ${bookId}, Chapter ${chapter}. Using placeholder verses.`);
      
      // Generate placeholder verses for the chapter
      const placeholderVerses: BibleVerse[] = [];
      const versesPerChapter = getStandardVerseCount(bookId, chapter);
      
      for (let i = 1; i <= versesPerChapter; i++) {
        placeholderVerses.push({
          id: -i,
          book_id: bookId,
          chapter: chapter,
          verse: i,
          text: `${bookName} ${chapter}:${i} is not available in the current database. The full KJV Bible contains this chapter.`,
          book_name: bookName
        });
      }
      
      return placeholderVerses;
    }
    
    console.log(`Found ${result.rows.length} verses in chapter ${chapter}`);
    return result.rows._array as BibleVerse[];
  } catch (error) {
    console.error('Error getting verses:', error);
    
    // Try to get the book name
    try {
      const db = await getDatabase();
      const bookResult = await executeSql(
        db,
        `SELECT name FROM kjv_books WHERE id = ?`,
        [bookId]
      );
      
      const bookName = bookResult.rows.length > 0 
        ? bookResult.rows._array[0]?.name 
        : `Book ${bookId}`;
      
      if (verse !== undefined) {
        // Return a single placeholder verse
        return [{
          id: -1,
          book_id: bookId,
          chapter: chapter,
          verse: verse,
          text: `This verse (${bookName} ${chapter}:${verse}) is not available due to a database error.`,
          book_name: bookName
        }];
      } else {
        // Generate placeholder verses for the chapter
        const placeholderVerses: BibleVerse[] = [];
        const versesPerChapter = getStandardVerseCount(bookId, chapter);
        
        for (let i = 1; i <= versesPerChapter; i++) {
          placeholderVerses.push({
            id: -i,
            book_id: bookId,
            chapter: chapter,
            verse: i,
            text: `This verse (${bookName} ${chapter}:${i}) is not available due to a database error.`,
            book_name: bookName
          });
        }
        
        return placeholderVerses;
      }
    } catch (innerError) {
      console.error('Error getting book name for placeholder:', innerError);
      
      // Ultimate fallback
      if (verse !== undefined) {
        return [{
          id: -1,
          book_id: bookId,
          chapter: chapter,
          verse: verse,
          text: `Bible verse not available due to a database error.`,
          book_name: `Book ${bookId}`
        }];
      } else {
        // Return a minimal set of placeholder verses
        const placeholderVerses: BibleVerse[] = [];
        for (let i = 1; i <= 10; i++) {
          placeholderVerses.push({
            id: -i,
            book_id: bookId,
            chapter: chapter,
            verse: i,
            text: `Bible verse not available due to a database error.`,
            book_name: `Book ${bookId}`
          });
        }
        return placeholderVerses;
      }
    }
  }
};

/**
 * Diagnose database issues and attempt repair
 */
export const diagnoseBibleDatabase = async (): Promise<string> => {
  try {
    // Get database instance
    const db = await getDatabase();
    
    // Check if tables exist
    const tablesResult = await executeSql(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND (name='kjv_books' OR name='kjv_verses')",
      []
    );
    
    const tables = tablesResult.rows._array.map(row => row.name);
    if (!tables.includes('kjv_books') || !tables.includes('kjv_verses')) {
      // Tables don't exist, try emergency init
      console.log('Essential tables missing, attempting emergency initialization...');
      const emergencySuccess = await emergencyDatabaseInit();
      
      if (emergencySuccess) {
        return 'Missing tables repaired with emergency data. Limited content available.';
      }
      return 'Missing essential tables. Will attempt to create them.';
    }
    
    // Check book count
    const booksResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_books', []);
    const booksCount = booksResult.rows._array[0].count;
    
    // Check verse count
    const versesResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_verses', []);
    const versesCount = versesResult.rows._array[0].count;
    
    if (booksCount < 66 || versesCount < 100) {
      // If we don't have all 66 books or at least 100 verses, try emergency init
      console.log(`Database underpopulated: ${booksCount} books, ${versesCount} verses`);
      
      // Try emergency init first as it's more reliable
      console.log('Using emergency initialization for underpopulated database...');
      const emergencySuccess = await emergencyDatabaseInit();
      
      if (emergencySuccess) {
        // Check counts again
        const newBooksResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_books', []);
        const newBooksCount = newBooksResult.rows._array[0].count;
        
        const newVersesResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_verses', []);
        const newVersesCount = newVersesResult.rows._array[0].count;
        
        return `Database repaired with emergency data. Now has ${newBooksCount} books and ${newVersesCount} verses. Limited content available.`;
      }
      
      // If emergency init failed, try asset-based population
      const populated = await populateFromAsset();
      
      if (populated) {
        // Check counts again
        const newBooksResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_books', []);
        const newBooksCount = newBooksResult.rows._array[0].count;
        
        const newVersesResult = await executeSql(db, 'SELECT COUNT(*) as count FROM kjv_verses', []);
        const newVersesCount = newVersesResult.rows._array[0].count;
        
        return `Database repaired. Now has ${newBooksCount} books and ${newVersesCount} verses.`;
      } else {
        return 'Failed to populate database from asset. Try reinstalling the app.';
      }
    }
    
    return `Database looks healthy: ${booksCount} books and ${versesCount} verses.`;
  } catch (error) {
    console.error('Error diagnosing database:', error);
    
    // Try emergency init if diagnosis failed
    try {
      console.log('Error during diagnosis, trying emergency initialization...');
      const emergencySuccess = await emergencyDatabaseInit();
      
      if (emergencySuccess) {
        return 'Database repaired with emergency data. Limited content available.';
      }
    } catch (emergencyError) {
      console.error('Emergency initialization failed during diagnosis:', emergencyError);
    }
    
    return 'Error diagnosing database. Try reinstalling the app.';
  }
};

/**
 * Force reloading the Bible database from the asset
    return 'Error diagnosing database. Try reinstalling the app.';
  }
};

/**
 * Force reloading the Bible database from the asset
 */
export const forceReloadBibleDatabase = async (): Promise<boolean> => {
  try {
    // Get database instance
    const db = await getDatabase();
    
    console.log('Dropping existing Bible tables...');
    
    // Drop existing tables
    await executeSql(db, 'DROP TABLE IF EXISTS kjv_verses', []);
    await executeSql(db, 'DROP TABLE IF EXISTS kjv_books', []);
    
    console.log('Recreating tables and populating from asset...');
    
    // Populate from asset
    const result = await populateFromAsset();
    
    if (result) {
      console.log('Database successfully reloaded from asset.');
    } else {
      console.error('Failed to reload database from asset.');
    }
    
    return result;
  } catch (error) {
    console.error('Error reloading database:', error);
    return false;
  }
};

// Insert complete list of Bible books
export const insertCompleteBibleBooks = async (db: Database): Promise<void> => {
  try {
    console.log('Inserting complete list of Bible books...');
    const books = [
      { id: 1, name: 'Genesis' },
      { id: 2, name: 'Exodus' },
      { id: 3, name: 'Leviticus' },
      { id: 4, name: 'Numbers' },
      { id: 5, name: 'Deuteronomy' },
      { id: 6, name: 'Joshua' },
      { id: 7, name: 'Judges' },
      { id: 8, name: 'Ruth' },
      { id: 9, name: 'I Samuel' },
      { id: 10, name: 'II Samuel' },
      { id: 11, name: 'I Kings' },
      { id: 12, name: 'II Kings' },
      { id: 13, name: 'I Chronicles' },
      { id: 14, name: 'II Chronicles' },
      { id: 15, name: 'Ezra' },
      { id: 16, name: 'Nehemiah' },
      { id: 17, name: 'Esther' },
      { id: 18, name: 'Job' },
      { id: 19, name: 'Psalms' },
      { id: 20, name: 'Proverbs' },
      { id: 21, name: 'Ecclesiastes' },
      { id: 22, name: 'Song of Solomon' },
      { id: 23, name: 'Isaiah' },
      { id: 24, name: 'Jeremiah' },
      { id: 25, name: 'Lamentations' },
      { id: 26, name: 'Ezekiel' },
      { id: 27, name: 'Daniel' },
      { id: 28, name: 'Hosea' },
      { id: 29, name: 'Joel' },
      { id: 30, name: 'Amos' },
      { id: 31, name: 'Obadiah' },
      { id: 32, name: 'Jonah' },
      { id: 33, name: 'Micah' },
      { id: 34, name: 'Nahum' },
      { id: 35, name: 'Habakkuk' },
      { id: 36, name: 'Zephaniah' },
      { id: 37, name: 'Haggai' },
      { id: 38, name: 'Zechariah' },
      { id: 39, name: 'Malachi' },
      { id: 40, name: 'Matthew' },
      { id: 41, name: 'Mark' },
      { id: 42, name: 'Luke' },
      { id: 43, name: 'John' },
      { id: 44, name: 'Acts' },
      { id: 45, name: 'Romans' },
      { id: 46, name: 'I Corinthians' },
      { id: 47, name: 'II Corinthians' },
      { id: 48, name: 'Galatians' },
      { id: 49, name: 'Ephesians' },
      { id: 50, name: 'Philippians' },
      { id: 51, name: 'Colossians' },
      { id: 52, name: 'I Thessalonians' },
      { id: 53, name: 'II Thessalonians' },
      { id: 54, name: 'I Timothy' },
      { id: 55, name: 'II Timothy' },
      { id: 56, name: 'Titus' },
      { id: 57, name: 'Philemon' },
      { id: 58, name: 'Hebrews' },
      { id: 59, name: 'James' },
      { id: 60, name: 'I Peter' },
      { id: 61, name: 'II Peter' },
      { id: 62, name: 'I John' },
      { id: 63, name: 'II John' },
      { id: 64, name: 'III John' },
      { id: 65, name: 'Jude' },
      { id: 66, name: 'Revelation' }
    ];
    
    // Delete any existing books
    await executeSql(db, 'DELETE FROM kjv_books', []);
    
    // Insert books
    for (const book of books) {
      await executeSql(
        db,
        'INSERT INTO kjv_books (id, name) VALUES (?, ?)',
        [book.id, book.name]
      );
    }
    
    console.log('Successfully inserted all 66 Bible books');
    
  } catch (error) {
    console.error('Error inserting Bible books:', error);
    throw error;
  }
};

// Insert essential verses
export const insertEssentialVerses = async (db: Database): Promise<void> => {
  try {
    console.log(`Inserting ${essentialVerses.length} essential verses...`);
    
    // Delete any existing verses
    await executeSql(db, 'DELETE FROM kjv_verses', []);
    
    // Insert essential verses
    for (const verse of essentialVerses) {
      await executeSql(
        db,
        'INSERT INTO kjv_verses (id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)',
        [verse.id, verse.book_id, verse.chapter, verse.verse, verse.text]
      );
    }
    
    // Add some additional verses to make the app more usable
    const additionalVerses = [
      // Genesis 1:1-5
      { id: 200, book_id: 1, chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.' },
      { id: 201, book_id: 1, chapter: 1, verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
      { id: 202, book_id: 1, chapter: 1, verse: 3, text: 'And God said, Let there be light: and there was light.' },
      { id: 203, book_id: 1, chapter: 1, verse: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
      { id: 204, book_id: 1, chapter: 1, verse: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
      
      // John 1:1-5
      { id: 300, book_id: 43, chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { id: 301, book_id: 43, chapter: 1, verse: 2, text: 'The same was in the beginning with God.' },
      { id: 302, book_id: 43, chapter: 1, verse: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
      { id: 303, book_id: 43, chapter: 1, verse: 4, text: 'In him was life; and the life was the light of men.' },
      { id: 304, book_id: 43, chapter: 1, verse: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
      
      // Romans 8:28-31
      { id: 400, book_id: 45, chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      { id: 401, book_id: 45, chapter: 8, verse: 29, text: 'For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren.' },
      { id: 402, book_id: 45, chapter: 8, verse: 30, text: 'Moreover whom he did predestinate, them he also called: and whom he called, them he also justified: and whom he justified, them he also glorified.' },
      { id: 403, book_id: 45, chapter: 8, verse: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?' },
      
      // Philippians 4:6-8
      { id: 500, book_id: 50, chapter: 4, verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
      { id: 501, book_id: 50, chapter: 4, verse: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
      { id: 502, book_id: 50, chapter: 4, verse: 8, text: 'Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.' },
      
      // Psalm 23 - complete
      { id: 600, book_id: 19, chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { id: 601, book_id: 19, chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { id: 602, book_id: 19, chapter: 23, verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.' },
      { id: 603, book_id: 19, chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { id: 604, book_id: 19, chapter: 23, verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { id: 605, book_id: 19, chapter: 23, verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
    ];
    
    // Insert additional verses
    for (const verse of additionalVerses) {
      await executeSql(
        db,
        'INSERT INTO kjv_verses (id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?)',
        [verse.id, verse.book_id, verse.chapter, verse.verse, verse.text]
      );
    }
    
    console.log(`Inserted ${essentialVerses.length + additionalVerses.length} total verses`);
    
  } catch (error) {
    console.error('Error inserting essential verses:', error);
    throw error;
  }
};

// A complete emergency database initialization 
export const emergencyDatabaseInit = async (): Promise<boolean> => {
  try {
    console.log('EMERGENCY DATABASE INITIALIZATION');
    const db = await getDatabase();
    
    // Create tables if they don't exist
    await createBibleTables(db);
    
    // Insert all 66 Bible books
    await insertCompleteBibleBooks(db);
    
    // Insert essential verses
    await insertEssentialVerses(db);
    
    console.log('Emergency database initialization complete');
    return true;
  } catch (error) {
    console.error('Error in emergency database initialization:', error);
    return false;
  }
};