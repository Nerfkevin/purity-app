# Purity App - Technical Stack Documentation

## Core Framework
- **Expo SDK**: v52.0.37 - React Native development platform
- **React**: v18.3.1 - JavaScript UI library
- **React Native**: v0.76.7 - Framework for building native apps using React
- **TypeScript**: v5.3.3 - Typed JavaScript

## Routing & Navigation
- **Expo Router**: v4.0.17 - File-based routing system for Expo apps
- **React Navigation (Native)**: v6.1.14 - Navigation library
- **React Navigation (Native Stack)**: v6.9.22 - Stack navigator

## Database & Storage
- **Expo SQLite**: v15.1.2 - SQLite database implementation
- **@expo/websql**: v1.0.1 - WebSQL compatibility layer
- **@react-native-async-storage/async-storage**: v1.23.1 - Asynchronous, persistent key-value storage
- **Expo Secure Store**: v14.0.1 - Secure storage for sensitive data

## Backend & APIs
- **Supabase**: v2.39.8 - Open source Firebase alternative

## UI Components & Styling
- **@expo/vector-icons**: v14.0.0 - Vector icon library
- **Expo Linear Gradient**: v14.0.2 - Linear gradient components
- **React Native SVG**: v15.8.0 - SVG support
- **React Native Safe Area Context**: v4.12.0 - Safe area utilities
- **Lucide React**: v0.363.0 - Icon set
- **Lucide React Native**: v0.363.0 - Icon set for React Native

## Utilities & Helpers
- **Expo Asset**: v11.0.4 - Asset management
- **Expo Constants**: v17.0.7 - App constants and config
- **Expo File System**: v18.0.11 - File system access
- **Expo Haptics**: v14.0.1 - Haptic feedback
- **Expo Linking**: v7.0.5 - Deep linking
- **Expo Sharing**: v13.0.1 - Content sharing
- **Expo Status Bar**: v2.0.1 - Status bar management
- **nanoid**: v5.0.6 - Unique ID generation
- **dotenv**: v16.4.7 - Environment variable management
- **react-native-get-random-values**: v1.11.0 - Cryptographically strong random values
- **react-native-url-polyfill**: v2.0.0 - URL polyfill

## Animations & Gestures
- **React Native Gesture Handler**: v2.20.2 - Native touches and gesture system
- **React Native Reanimated**: v3.16.1 - Animations library

## Configuration
- **App Name**: Purity
- **Slug**: purity
- **Version**: 1.0.0
- **Orientation**: portrait
- **User Interface Style**: light
- **New Architecture Enabled**: true

## Bible Database Features
The app includes a SQLite Bible database with the following capabilities:
- Bible verse retrieval by reference
- Chapter retrieval
- Random verse selection
- Text search functionality
- Daily scripture feature
- Emergency scripture feature

## Assets
- Database file: KJV.db (King James Version Bible)
- Various image and icon assets

## Development Scripts
- `npm expo start`: Start Expo development server

- `npm run lint`: Run linting

## Notes for Future Development
- The app uses environment variables for Supabase configuration
- Bible database interactions are handled through the `lib/bibleDatabase.ts` module
- All database operations are asynchronous and return Promise-based results 


#### Table: `KJV_books`
This table lists all the books in the given translation of the Bible.

| Column Name | Type          | Nullable | Key         | Default | Extra          | Description                       |
|-------------|---------------|----------|-------------|---------|----------------|-----------------------------------|
| `id`        | int           | NO       | Primary Key | NULL    | auto_increment | Unique identifier for each book.  |
| `name`      | varchar(255)  | YES      |             | NULL    |                | The name of the book.             |

#### Table: `KJV_verses`
This table contains all the verses in the given translation of the Bible.

| Column Name | Type          | Nullable | Key         | Default | Extra          | Description                       |
|-------------|---------------|----------|-------------|---------|----------------|-----------------------------------|
| `id`        | int           | NO       | Primary Key | NULL    | auto_increment | Unique identifier for each verse. |
| `book_id`   | int           | YES      | Index       | NULL    |                | The ID of the book (foreign key to `KJV_books`). |
| `chapter`   | int           | YES      |             | NULL    |                | The chapter number.               |
| `verse`     | int           | YES      |             | NULL    |                | The verse number.                 |
| `text`      | text          | YES      |             | NULL    |                | The text of the verse.            |
