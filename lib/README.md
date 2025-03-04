# Purity App - Library Code

This directory contains the core libraries and utilities for the Purity app.

## Directory Structure

```
/lib
├── database/               # Database services and utilities
│   ├── bibleDatabaseService.ts  # Core Bible database functionality
│   ├── scriptureService.ts      # Specialized scripture services
│   └── index.ts                 # Exports all database services
├── hooks/                  # React hooks for state management
│   └── useBibleDatabase.tsx     # Hook for Bible database access
├── utils/                  # Utility functions and helpers
└── types/                  # TypeScript type definitions
```

## Key Components

### Database Module

The `database` directory contains all database-related functionality, focused on providing efficient access to the Bible database. See the [Database README](./database/README.md) for more details.

### Hooks

The `hooks` directory contains custom React hooks that provide a clean interface for accessing the app's functionality while managing state.

- **useBibleDatabase**: Provides access to Bible data with proper state management, error handling, and database lifecycle management.

## Best Practices

1. **Separation of Concerns**: Keep UI components separate from data access and business logic.
2. **Type Safety**: Use TypeScript types and interfaces for all code.
3. **Error Handling**: Implement consistent error handling throughout the codebase.
4. **Documentation**: Document all exported functions, types, and components.
5. **Testing**: Write unit tests for critical functionality.
