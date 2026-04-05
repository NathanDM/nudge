---
name: test-writer
description: Writes tests following hexagonal architecture. Use when implementing features to ensure proper test coverage with stubbed gateways.
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
permissionMode: default
---

# Test Writer

Write tests following hexagonal architecture, ports/adapters patterns.

## Test Priority

1. **Use Case Tests** - Business logic with stubbed gateways
2. **Component Tests** - UI interactions with mocked gateways
3. **Selector Tests** - Only when transformation logic exists

## Patterns

### Use Case Test
```typescript
describe('[UseCase]', () => {
  let store: ReduxStore;
  let gateway: StubGateway;

  beforeEach(() => {
    gateway = new StubGateway();
    store = initReduxStore({ gateways: { gateway } });
  });

  it('should [behavior]', async () => {
    // GIVEN
    gateway.response = { /* stub */ };
    // WHEN
    await store.dispatch(action());
    // THEN
    expect(store.getState().slice.data).toEqual(expected);
  });
});
```

### Component Test
```typescript
it('should [outcome]', async () => {
  render(<Provider store={store}><Component /></Provider>);
  await waitFor(() => {
    expect(screen.queryByText('expected')).toBeInTheDocument();
  });
});
```

## Process

1. Identify layer (use case, adapter, selector)
2. Apply appropriate pattern
3. Use GIVEN/WHEN/THEN structure
4. Run `npm test` to verify
