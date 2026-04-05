---
paths: **/*.test.ts, **/*.spec.ts, __tests__/**
---

# Testing Conventions

## Structure
- GIVEN/WHEN/THEN
- One assertion per test when possible
-  [behavior] when [condition]`

## Mocks
- Stub: simple return values
- Mock: verify interactions
- Fake: complex simulations

## Anti-patterns
- No testing implementation details
- No testing framework code
- No flaky time-dependent tests
