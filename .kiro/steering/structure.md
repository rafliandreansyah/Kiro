# Project Structure

```
src/
├── types/
│   └── index.ts          # All shared TypeScript interfaces and types
├── context/
│   ├── AppContext.tsx     # React Context provider + useAppContext hook
│   └── todoReducer.ts    # AppState, AppAction union type, todoReducer, initialState
├── services/
│   └── storageService.ts # localStorage read/write (StorageService object)
├── utils/
│   ├── todoUtils.ts      # filterTodos(), sortTodos() — pure functions
│   └── validator.ts      # validateTodoTitle(), validateCategoryName()
├── components/           # Presentational/UI components
├── __tests__/
│   ├── components/       # @testing-library/react component tests
│   ├── unit/             # Example-based unit tests for reducer, services, utils
│   └── property/         # fast-check property-based tests
├── App.tsx               # Root component — wraps AppProvider
├── main.tsx              # Entry point
└── setupTests.ts         # Vitest global test setup
```

## Conventions

- **Types first** — all interfaces and type aliases live in `src/types/index.ts`; import from there everywhere
- **Pure utilities** — `todoUtils.ts` and `validator.ts` are side-effect-free; keep them that way
- **Reducer is the single source of truth** — never mutate state directly; always dispatch an `AppAction`
- **Components consume context** via `useAppContext()`; never pass `dispatch` as a prop through multiple layers
- **Test placement**:
  - Pure functions / reducer → `__tests__/unit/` or `__tests__/property/`
  - React components → `__tests__/components/`
  - Property tests use `fast-check` (`fc`) and target correctness invariants
- **IDs** — always use `crypto.randomUUID()` for generating `Todo` and `Category` IDs
- **Dates** — `dueDate` is `YYYY-MM-DD` string or `null`; `createdAt` is a full ISO 8601 datetime string
