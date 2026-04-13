# Project Guidelines



## Code Style

### Functions
- 0-1 args ideal, 2 acceptable, 3 max (extract to object beyond)
- Extract until you cannot extract further
- Max 20 lines, single responsibility

### Structure
- Files: 50-100 lines avg, 200 max
- Lines: 80 soft, 120 hard
- Inline single-statement conditionals (remove unnecessary braces)
  ```typescript
  // Good
  if (condition) doSomething();
  if (x) doThis();
  else doThat();

  // Avoid
  if (condition) {
    doSomething();
  }
  ```
- Low cyclomatic/cognitive complexity
- Feature-specific code in feature folders, not `common/` (e.g., OTPInput in `auth/` not `common/`)

## Testing

### Use Case Tests
```typescript
// GIVEN - stub gateway responses
// WHEN - dispatch action
// THEN - assert state
```

### Component Tests
```typescript
// GIVEN - mock gateway, init store
// WHEN - render, interact
// THEN - assert DOM with waitFor
```

### Selectors
Only test transformation logic, skip trivial property access.

## Git

Conventional commits, title only, no description, no AI mentions:
- `feat(scope): description`
- `fix(scope): description`
- `refactor(scope): description`
- `test(scope): description`

## Comments

Avoid. Acceptable: legal headers, regex explanations, consequence warnings.
Never commit commented-out code.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
