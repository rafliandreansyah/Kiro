# Tech Stack

## Core
- **React 18** with TypeScript (strict mode)
- **Vite 6** — dev server and bundler
- **Tailwind CSS 3** — utility-first styling, dark mode via `media` strategy

## State Management
- `useReducer` + React Context (`AppContext`) — no external state library
- All actions go through `todoReducer` via `dispatch`

## Persistence
- `localStorage` via `StorageService` — only `todos` and `categories` are persisted (`PersistedState`)

## Testing
- **Vitest** — test runner (configured in `vite.config.ts`)
- **@testing-library/react** — component tests
- **fast-check** — property-based testing (PBT)
- **jsdom** — browser environment for tests
- Setup file: `src/setupTests.ts`

## Common Commands

```bash
# Development server (run manually in terminal)
npm run dev

# Production build
npm run build

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint
```

## TypeScript
- Project references setup: `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`
- Use `import type` for type-only imports
