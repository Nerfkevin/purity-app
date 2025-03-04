import { getDailyScripture, getEmergencyScripture } from '../bibleDatabase';
import * as scriptureListsModule from '../scriptureLists';
// Jest globals are auto-imported with TypeScript

// Mock the scriptureLists module
jest.mock('../scriptureLists', () => ({
  getRandomScripture: jest.fn(),
  dailyScriptures: [],
  emergencyScriptures: []
}));

describe('Bible Database Functions', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });
  
  describe('getDailyScripture', () => {
    test('returns formatted scripture when random selection succeeds', async () => {
      // Arrange
      const mockScripture = {
        book: 'Psalms',
        chapter: 23,
        verse: 1,
        text: 'The LORD is my shepherd; I shall not want.'
      };
      
      (scriptureListsModule.getRandomScripture as jest.Mock).mockReturnValue(mockScripture);
      
      // Act
      const result = await getDailyScripture();
      
      // Assert
      expect(scriptureListsModule.getRandomScripture).toHaveBeenCalledWith(
        scriptureListsModule.dailyScriptures
      );
      
      expect(result).not.toBeNull();
      expect(result?.book_name).toBe('Psalms');
      expect(result?.chapter).toBe(23);
      expect(result?.verse).toBe(1);
      expect(result?.text).toBe('The LORD is my shepherd; I shall not want.');
    });
    
    test('returns null when random selection fails', async () => {
      // Arrange
      (scriptureListsModule.getRandomScripture as jest.Mock).mockReturnValue(null);
      
      // Act
      const result = await getDailyScripture();
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('getEmergencyScripture', () => {
    test('returns formatted scripture when random selection succeeds', async () => {
      // Arrange
      const mockScripture = {
        book: '1 Corinthians',
        chapter: 10,
        verse: 13,
        text: 'There hath no temptation taken you but such as is common to man...'
      };
      
      (scriptureListsModule.getRandomScripture as jest.Mock).mockReturnValue(mockScripture);
      
      // Act
      const result = await getEmergencyScripture('temptation');
      
      // Assert
      expect(scriptureListsModule.getRandomScripture).toHaveBeenCalledWith(
        scriptureListsModule.emergencyScriptures
      );
      
      expect(result).not.toBeNull();
      expect(result?.book_name).toBe('1 Corinthians');
      expect(result?.chapter).toBe(10);
      expect(result?.verse).toBe(13);
      expect(result?.text).toBe('There hath no temptation taken you but such as is common to man...');
    });
    
    test('returns null when random selection fails', async () => {
      // Arrange
      (scriptureListsModule.getRandomScripture as jest.Mock).mockReturnValue(null);
      
      // Act
      const result = await getEmergencyScripture();
      
      // Assert
      expect(result).toBeNull();
    });
  });
}); 