---
name: development-workflow
description: Guides feature implementation with hexagonal architecture and test-last approach. Use when implementing features with commits between implementation and test phases.
---

# Development Workflow

Optimized for LLM-assisted coding with hexagonal architecture.

## Steps

### 1. Use Case Implementation
Implement business logic in use case layer.
```bash
# Verify no regressions
npm test
git add -A && git commit -m "feat([scope]): implement [feature] use case"
```

### 2. Use Case Tests
Write tests for the implemented use case with stubbed gateways.
```bash
npm test -- --testPathPattern=[feature]
git add -A && git commit -m "test([scope]): add [feature] use case tests"
```

### 3. Secondary Adapter
Implement real gateway (API, database, etc.).
```bash
npm test
git add -A && git commit -m "feat([scope]): add [feature] gateway"
```

### 4. Primary Adapter
Build UI/CLI layer consuming the use case.
```bash
npm test
git add -A && git commit -m "feat([scope]): add [feature] ui"
```

### 5. Adapter Tests
Write component/integration tests for adapters.
```bash
npm test
git add -A && git commit -m "test([scope]): add [feature] adapter tests"
```

## Test Structure
```typescript
// GIVEN - setup (stub/mock gateway)
// WHEN - action (dispatch/render)
// THEN - assertion (state/DOM)
```

## Commit Format

`type(scope): description`

Types: feat, fix, refactor, test, docs, chore
