import { GiftIdea } from './gift-idea.entity';

const makeGift = (overrides: Partial<{
  forUserId: string;
  claimedByUserId: string | null;
  claimedAnonymously: boolean;
}> = {}): GiftIdea =>
  new GiftIdea(
    'gift-1',
    overrides.forUserId ?? 'owner-1',
    'adder-1',
    'Vélo',
    null,
    null,
    null,
    overrides.claimedByUserId ?? null,
    null,
    overrides.claimedAnonymously ?? false,
    null,
    new Date(),
  );

describe('GiftIdea.isClaimed', () => {
  it('returns false when unclaimed', () => {
    expect(makeGift().isClaimed()).toBe(false);
  });

  it('returns true when claimed by a user', () => {
    expect(makeGift({ claimedByUserId: 'claimer-1' }).isClaimed()).toBe(true);
  });

  it('returns true when claimed anonymously', () => {
    expect(makeGift({ claimedAnonymously: true }).isClaimed()).toBe(true);
  });
});

describe('GiftIdea.canBeClaimedBy', () => {
  it('allows non-owner to claim unclaimed gift', () => {
    expect(makeGift().canBeClaimedBy('other-1')).toBe(true);
  });

  it('blocks owner from claiming own gift', () => {
    expect(makeGift().canBeClaimedBy('owner-1')).toBe(false);
  });

  it('blocks claiming an already anonymously claimed gift', () => {
    expect(makeGift({ claimedAnonymously: true }).canBeClaimedBy('other-1')).toBe(false);
  });

  it('blocks claiming a gift already claimed by a user', () => {
    expect(makeGift({ claimedByUserId: 'claimer-1' }).canBeClaimedBy('other-1')).toBe(false);
  });
});

describe('GiftIdea.canBeUnclaimedByOwner', () => {
  it('returns true when owner calls and gift is anonymously claimed', () => {
    expect(makeGift({ claimedAnonymously: true }).canBeUnclaimedByOwner('owner-1')).toBe(true);
  });

  it('returns false when non-owner calls', () => {
    expect(makeGift({ claimedAnonymously: true }).canBeUnclaimedByOwner('other-1')).toBe(false);
  });

  it('returns false when gift is not anonymously claimed', () => {
    expect(makeGift({ claimedAnonymously: false }).canBeUnclaimedByOwner('owner-1')).toBe(false);
  });
});
