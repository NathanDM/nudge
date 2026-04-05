# Code Organization

## File Creation Rules

### Do NOT Create
- **README.md** files for components/modules
- **index.ts** barrel exports (use direct imports)
- **example.tsx** files or demo files
- **Documentation** files unless explicitly requested

### Rationale
- Keep codebase lean and focused on production code
- Avoid maintenance overhead of documentation files
- Use inline comments for component documentation when needed
- TypeScript types serve as documentation

## Direct Imports
Use direct imports instead of barrel exports:

```typescript
// Good
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ErrorBanner } from '@/components/common/ErrorBanner';

// Avoid
import { ErrorMessage, ErrorBanner } from '@/components/common';
```