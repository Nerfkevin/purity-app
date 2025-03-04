/**
 * Scripture Service
 * 
 * This service handles specialized scripture functionality like
 * daily verses and emergency response verses.
 */

import { getVerse, getRandomVerse, searchVerses, Scripture } from './bibleDatabaseService';

// Default categories for emergency verses
export enum EmergencyCategory {
  TEMPTATION = 'temptation',
  ANXIETY = 'anxiety',
  DEPRESSION = 'depression',
  GUIDANCE = 'guidance',
  COMFORT = 'comfort'
}

// Structure for scripture references
export interface ScriptureReference {
  book: string;
  chapter: number;
  verse: number;
}

// Date utility function to get current date string
const getCurrentDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

// Module-level cache for daily scripture to avoid multiple database calls on the same day
let dailyScriptureCache: {
  date: string;
  scripture: Scripture | null;
} | null = null;

/**
 * Get the daily scripture verse
 * Will remain the same throughout the day and change at midnight
 */
export const getDailyScripture = async (): Promise<Scripture | null> => {
  const currentDate = getCurrentDateString();
  
  // Return cached scripture if available for today
  if (dailyScriptureCache && dailyScriptureCache.date === currentDate) {
    console.log('Using cached daily scripture for', currentDate);
    return dailyScriptureCache.scripture;
  }
  
  // Get today's scripture from the pre-defined list or a random one
  try {
    // Pick a fixed verse based on the day of the year to ensure consistency
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Get the appropriate verse for today based on the daily scripture list
    // If it's not available, get a random verse as fallback
    const scripture = await getScriptureFromReference(getDailyScriptureForDay(dayOfYear));
    
    // Cache the result
    dailyScriptureCache = {
      date: currentDate,
      scripture: scripture
    };
    
    return scripture;
  } catch (error) {
    console.error('Error getting daily scripture:', error);
    
    // Try to get a random verse as fallback
    const randomScripture = await getRandomVerse();
    
    // Cache the result
    dailyScriptureCache = {
      date: currentDate,
      scripture: randomScripture
    };
    
    return randomScripture;
  }
};

/**
 * Get an emergency scripture based on the specified category
 */
export const getEmergencyScripture = async (category: EmergencyCategory = EmergencyCategory.TEMPTATION): Promise<Scripture | null> => {
  try {
    // Get a reference from the emergency category
    const scriptureRef = getEmergencyScriptureReference(category);
    return await getScriptureFromReference(scriptureRef);
  } catch (error) {
    console.error(`Error getting emergency scripture for category "${category}":`, error);
    
    // Fallback: search for verses containing the category keyword
    const searchResults = await searchVerses(category.toString(), 10);
    
    if (searchResults && searchResults.length > 0) {
      // Select a random verse from the search results
      const randomIndex = Math.floor(Math.random() * searchResults.length);
      return searchResults[randomIndex];
    }
    
    // If all else fails, return a random verse
    return await getRandomVerse();
  }
};

/**
 * Get a Scripture from a ScriptureReference
 */
export const getScriptureFromReference = async (reference: ScriptureReference): Promise<Scripture | null> => {
  return await getVerse(reference.book, reference.chapter, reference.verse);
};

/**
 * Get a daily scripture reference for a specific day
 * This will be replaced with your actual list of daily scriptures
 */
export const getDailyScriptureForDay = (dayOfYear: number): ScriptureReference => {
  // This is a placeholder - you will add your actual daily scripture list here
  // For now, we'll use modulo to cycle through a small set of verses
  const dailyScriptures: ScriptureReference[] = [
    { book: "Philippians", chapter: 4, verse: 13 },
    { book: "Psalms", chapter: 118, verse: 24 },
    { book: "Isaiah", chapter: 40, verse: 31 },
    { book: "Romans", chapter: 8, verse: 28 },
    { book: "John", chapter: 3, verse: 16 },
    { book: "Jeremiah", chapter: 29, verse: 11 },
    { book: "Proverbs", chapter: 3, verse: 5 }
  ];
  
  // Use modulo to cycle through the list
  const index = dayOfYear % dailyScriptures.length;
  return dailyScriptures[index];
};

/**
 * Get an emergency scripture reference for a specific category
 * This will be replaced with your actual lists of emergency scriptures by category
 */
export const getEmergencyScriptureReference = (category: EmergencyCategory): ScriptureReference => {
  // Define emergency scriptures by category
  const emergencyScriptures: Record<string, ScriptureReference[]> = {
    [EmergencyCategory.TEMPTATION]: [
      { book: "1 Corinthians", chapter: 10, verse: 13 },
      { book: "James", chapter: 4, verse: 7 },
      { book: "Matthew", chapter: 26, verse: 41 }
    ],
    [EmergencyCategory.ANXIETY]: [
      { book: "Philippians", chapter: 4, verse: 6 },
      { book: "1 Peter", chapter: 5, verse: 7 },
      { book: "Matthew", chapter: 6, verse: 34 }
    ],
    [EmergencyCategory.DEPRESSION]: [
      { book: "Psalm", chapter: 34, verse: 17 },
      { book: "Isaiah", chapter: 41, verse: 10 },
      { book: "Psalm", chapter: 3, verse: 3 }
    ],
    [EmergencyCategory.GUIDANCE]: [
      { book: "Proverbs", chapter: 3, verse: 5 },
      { book: "Psalm", chapter: 32, verse: 8 },
      { book: "James", chapter: 1, verse: 5 }
    ],
    [EmergencyCategory.COMFORT]: [
      { book: "Psalm", chapter: 23, verse: 4 },
      { book: "Matthew", chapter: 11, verse: 28 },
      { book: "2 Corinthians", chapter: 1, verse: 3 }
    ]
  };

  // Get verses for the specified category
  const verses = emergencyScriptures[category.toString()];
  
  // Select a random verse from the category
  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex];
};
