import { getRandomScripture, ScriptureVerse } from '../scriptureLists';
// Jest globals are auto-imported with TypeScript

describe('Scripture Lists', () => {
  // Test getting a random scripture
  test('getRandomScripture returns a verse from a non-empty list', () => {
    // Arrange
    const mockScriptures: ScriptureVerse[] = [
      {
        book: 'Genesis',
        chapter: 1,
        verse: 1,
        text: 'In the beginning God created the heaven and the earth.'
      },
      {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
      }
    ];
    
    // Act
    const result = getRandomScripture(mockScriptures);
    
    // Assert
    expect(result).not.toBeNull();
    expect(mockScriptures).toContainEqual(result);
  });
  
  // Test with empty list
  test('getRandomScripture returns null for empty list', () => {
    // Arrange
    const emptyList: ScriptureVerse[] = [];
    
    // Act
    const result = getRandomScripture(emptyList);
    
    // Assert
    expect(result).toBeNull();
  });
  
  // Test with undefined list
  test('getRandomScripture returns null for undefined list', () => {
    // Arrange & Act
    const result = getRandomScripture(undefined as unknown as ScriptureVerse[]);
    
    // Assert
    expect(result).toBeNull();
  });
  
  // Test random selection distribution (basic)
  test('getRandomScripture provides roughly even distribution', () => {
    // Arrange
    const mockScriptures: ScriptureVerse[] = [
      { book: 'Genesis', chapter: 1, verse: 1, text: 'First verse' },
      { book: 'Exodus', chapter: 2, verse: 2, text: 'Second verse' },
      { book: 'Leviticus', chapter: 3, verse: 3, text: 'Third verse' }
    ];
    
    const counts = {
      'First verse': 0,
      'Second verse': 0,
      'Third verse': 0
    };
    
    // Act
    for (let i = 0; i < 300; i++) {
      const result = getRandomScripture(mockScriptures);
      if (result) {
        counts[result.text as keyof typeof counts]++;
      }
    }
    
    // Assert - each verse should be selected roughly 1/3 of the time
    // We use a loose threshold to avoid flaky tests
    Object.values(counts).forEach(count => {
      expect(count).toBeGreaterThan(50); // Should get at least 50 out of 300
    });
  });
}); 