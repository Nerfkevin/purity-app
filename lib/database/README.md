# Bible Database Architecture

This folder contains the database services for the Purity app, providing efficient and type-safe access to the Bible database.

## Services

### Bible Database Service (`bibleDatabaseService.ts`)

This service handles all core interactions with the SQLite Bible database. It provides methods to:

- Initialize and manage the database connection
- Verify database health and perform repairs
- Execute SQL queries with proper error handling
- Retrieve verses, chapters, books, and perform searches

### Scripture Service (`scriptureService.ts`)

This service builds on top of the Bible Database Service to provide specialized scripture functionality:

- Daily verses (consistent for a given day)
- Emergency verses categorized by need (temptation, anxiety, etc.)
- Scripture references and utility functions

## Database Schema

The Bible database (`KJV.db`) contains two main tables:

### KJV_books

| Column  | Type         | Description                      |
|---------|--------------|----------------------------------|
| id      | INTEGER      | Primary key for the book         |
| name    | VARCHAR(255) | Name of the book                 |

### KJV_verses

| Column   | Type         | Description                      |
|----------|--------------|----------------------------------|
| id       | INTEGER      | Primary key for the verse        |
| book_id  | INTEGER      | Foreign key to KJV_books.id      |
| chapter  | INTEGER      | Chapter number                   |
| verse    | INTEGER      | Verse number                     |
| text     | TEXT         | Text content of the verse        |

## Usage

For most use cases in components, use the `useBibleDatabase` hook from `lib/hooks/useBibleDatabase.tsx` which provides React state integration with these services.

Example:

```typescript
import { useBibleDatabase } from '../lib/hooks/useBibleDatabase';

function MyComponent() {
  const { 
    getVerse, 
    getChapter, 
    searchVerses,
    isDatabaseInitialized 
  } = useBibleDatabase();

  // Now you can use these methods in your component
}
```

For direct access to the database services (not recommended in components):

```typescript
import { getVerse, getChapter } from '../lib/database';
```

## Best Practices

1. Always use parameterized queries to prevent SQL injection
2. Handle database errors gracefully with try/catch blocks
3. Cache frequently accessed data to improve performance
4. Use transactions for multiple related operations
5. Close the database connection when no longer needed
