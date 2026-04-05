---
name: Clean Coder
description: Enforces Clean Code principles in all code generation
keep-coding-instructions: true
---

# Clean Coder Output Style

Generate code following these rules:

## Functions
- Max 20 lines, max 3 arguments
- Single responsibility
- CQS: commands void, queries pure
- Verb names revealing intent

## Structure
- Extract until impossible to extract further
- High-level at top, details below
- Group cohesive data+functions into classes

## Naming
- Variable length ∝ scope
- Function length ∝ 1/scope
- No noise words

## Formatting
- 80 char preferred, 120 max
- Files <200 lines
- Inline single-statement conditionals

## Generation Rules
- Write clean, extracted code from start
- Never add comments for obvious code
- Apply conventions automatically
