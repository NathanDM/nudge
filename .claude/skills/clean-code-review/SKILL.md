---
name: clean-code-review
description: Reviews code against Clean Code principles including function size, argument count, CQS, and naming conventions. Use after writing code or before commits.
allowed-tools: Read, Grep, Glob
---

# Clean Code Review

## Criteria

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Function lines | <20 | 20-50 | >50 |
| Arguments | 0-1 | 2-3 | >3 |
| Cyclomatic | <10 | 10-15 | >15 |
| Nesting depth | ≤2 | 3 | >3 |

## CQS Check
- Commands: modify state, return void
- Queries: return value, no side effects
- Violation: returns value AND modifies state

## Naming Check
- Short scope → short name
- Long scope → descriptive name
- No noise words (Data, Info, Manager)

## Architecture Check
- Domain: no external dependencies
- Use cases: import domain only
- Adapters: don't import each other

## Output
```markdown
## [File]

| Function | Lines | Args | CQS | Status |
|----------|-------|------|-----|--------|

### Issues
- Line X: [issue] → [fix]

### Recommendations
1. [action]
```
