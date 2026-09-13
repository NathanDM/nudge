import journal from '../infrastructure/database/migrations/meta/_journal.json';

// The Drizzle migrator only applies entries whose `when` exceeds the last applied one:
// a non-increasing `when` is a migration that silently never runs in prod.
describe('migrations journal', () => {
  const whens = journal.entries.map((e) => e.when);

  it('has strictly increasing when values', () => {
    whens.forEach((w, i) => {
      if (i > 0) expect(w).toBeGreaterThan(whens[i - 1]);
    });
  });

  it('never dates a migration in the future', () => {
    expect(Math.max(...whens)).toBeLessThanOrEqual(Date.now());
  });

  it('has contiguous idx values', () => {
    expect(journal.entries.map((e) => e.idx)).toEqual(whens.map((_, i) => i));
  });
});
