---
paths: src/**/*.ts, src/**/*.tsx
---

# TypeScript Conventions

## Types
- `interface` for object shapes
- `type` for unions, intersections, mapped types
- No `any`, use `unknown` and narrow

## Functions
- Explicit return types on public functions
- Inferred types acceptable for private/local

## Imports
- Absolute for cross-module
- Relative within same module

## Async
- Always async/await over .then()
- Handle errors at boundaries
