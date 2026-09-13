import { describe, it, expect } from 'vitest';
import { textColorFor, getInitials } from './avatar';

describe('getInitials', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(getInitials('bob martin')).toBe('BM');
    expect(getInitials('Anne Marie Dupont')).toBe('AM');
  });

  it('handles single names and extra spaces', () => {
    expect(getInitials('Léa')).toBe('L');
    expect(getInitials('  Bob   Martin ')).toBe('BM');
  });
});

describe('textColorFor', () => {
  it('uses dark ink on light backgrounds and white on dark ones', () => {
    expect(textColorFor('#FFD2B3')).toBe('#2D5954');
    expect(textColorFor('#2D5954')).toBe('#fff');
  });
});
