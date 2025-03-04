/**
 * This file contains predefined lists of Bible verses for daily and emergency scriptures.
 * The lists are static and used for offline access in the app.
 */

// Structure for verse objects
export interface ScriptureVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

// Scripture interface matching the format we'll use throughout the app
export interface Scripture {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Daily Scripture Verses
 * These are randomly selected each day for the daily scripture feature.
 */
export const dailyScriptures: ScriptureVerse[] = [
  // NOTE: This is just a starter list. The user will provide their own list
  {
    book: "Philippians",
    chapter: 4,
    verse: 13,
    text: "I can do all things through Christ which strengtheneth me."
  },
  {
    book: "Psalms",
    chapter: 118,
    verse: 24,
    text: "This is the day which the LORD hath made; we will rejoice and be glad in it."
  },
  {
    book: "Isaiah",
    chapter: 40,
    verse: 31,
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
  }
];

/**
 * Emergency Scripture Verses
 * These are randomly selected when a user needs emergency spiritual support.
 * They are categorized to provide relevant verses for different situations.
 */
export const emergencyScriptures: ScriptureVerse[] = [
  // NOTE: This is just a starter list. The user will provide their own list
  {
    book: "1 Corinthians",
    chapter: 10,
    verse: 13,
    text: "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it."
  },
  {
    book: "James",
    chapter: 4,
    verse: 7,
    text: "Submit yourselves therefore to God. Resist the devil, and he will flee from you."
  },
  {
    book: "Psalms",
    chapter: 46,
    verse: 1,
    text: "God is our refuge and strength, a very present help in trouble."
  }
];

/**
 * Get a random scripture from the provided list
 * @param scriptureList - The list of scriptures to select from
 * @returns A randomly selected scripture or null if the list is empty
 */
export function getRandomScripture(scriptureList: ScriptureVerse[]): ScriptureVerse | null {
  if (!scriptureList || scriptureList.length === 0) {
    console.error('Scripture list is empty or undefined');
    return null;
  }
  
  try {
    const randomIndex = Math.floor(Math.random() * scriptureList.length);
    return scriptureList[randomIndex];
  } catch (error) {
    console.error('Error selecting random scripture:', error);
    return null;
  }
}

/**
 * Get a daily scripture
 * @returns A randomly selected scripture from the daily scriptures list
 */
export function getDailyScripture(): Scripture | null {
  const verse = getRandomScripture(dailyScriptures);
  if (!verse) return null;
  
  return {
    book_name: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text
  };
}

/**
 * Get an emergency scripture
 * @returns A randomly selected scripture from the emergency scriptures list
 */
export function getEmergencyScripture(): Scripture | null {
  const verse = getRandomScripture(emergencyScriptures);
  if (!verse) return null;
  
  return {
    book_name: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text
  };
} 