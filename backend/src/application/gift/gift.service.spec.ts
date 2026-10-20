import { BadRequestException } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftIdea } from '../../domain/gift/gift-idea.entity';

const LINK = 'https://shop.test/item';
const OG_IMAGE = 'https://shop.test/og.jpg';
const CUSTOM = 'https://img.test/custom.jpg';

const makeGift = (overrides: Partial<{ url: string | null; ogImageUrl: string | null }> = {}) =>
  new GiftIdea(
    'gift-1', 'owner-1', 'adder-1', 'Vélo', null,
    overrides.url ?? null, null, null, null, false,
    overrides.ogImageUrl ?? null, new Date(),
  );

const makeService = (gift: GiftIdea | null = null) => {
  const giftRepo = {
    findById: jest.fn().mockResolvedValue(gift),
    create: jest.fn(),
    update: jest.fn(),
  };
  const userRepo = { findById: jest.fn().mockResolvedValue(null) };
  return { service: new GiftService(giftRepo as any, userRepo as any), giftRepo };
};

const stubLinkPage = () =>
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: async () => `<meta property="og:image" content="${OG_IMAGE}">`,
  } as Response);

const savedImage = (repoCall: jest.Mock) => repoCall.mock.calls[0].at(-1).ogImageUrl;

afterEach(() => jest.restoreAllMocks());

describe('GiftService.createGift image', () => {
  it('uses the custom image over the link image', async () => {
    // GIVEN
    stubLinkPage();
    const { service, giftRepo } = makeService();
    // WHEN
    await service.createGift('owner-1', 'adder-1', { title: 'Vélo', url: LINK, imageUrl: CUSTOM });
    // THEN
    expect(savedImage(giftRepo.create)).toBe(CUSTOM);
  });

  it('falls back to the link image without a custom image', async () => {
    // GIVEN
    stubLinkPage();
    const { service, giftRepo } = makeService();
    // WHEN
    await service.createGift('owner-1', 'adder-1', { title: 'Vélo', url: LINK });
    // THEN
    expect(savedImage(giftRepo.create)).toBe(OG_IMAGE);
  });

  it('rejects an image that is not an http(s) URL', async () => {
    // GIVEN
    const { service } = makeService();
    // WHEN
    const creating = service.createGift('owner-1', 'adder-1', { title: 'Vélo', imageUrl: 'javascript:alert(1)' });
    // THEN
    await expect(creating).rejects.toThrow(BadRequestException);
  });
});

describe('GiftService.updateGift image', () => {
  it('replaces the link image with a custom image', async () => {
    // GIVEN
    const { service, giftRepo } = makeService(makeGift({ url: LINK, ogImageUrl: OG_IMAGE }));
    // WHEN
    await service.updateGift('gift-1', 'adder-1', { title: 'Vélo', url: LINK, imageUrl: CUSTOM });
    // THEN
    expect(savedImage(giftRepo.update)).toBe(CUSTOM);
  });

  it('keeps the custom image when nothing changes', async () => {
    // GIVEN
    const fetch = stubLinkPage();
    const { service, giftRepo } = makeService(makeGift({ url: LINK, ogImageUrl: CUSTOM }));
    // WHEN
    await service.updateGift('gift-1', 'adder-1', { title: 'Vélo', url: LINK, imageUrl: CUSTOM });
    // THEN
    expect(savedImage(giftRepo.update)).toBe(CUSTOM);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('goes back to the link image when the custom image is cleared', async () => {
    // GIVEN
    stubLinkPage();
    const { service, giftRepo } = makeService(makeGift({ url: LINK, ogImageUrl: CUSTOM }));
    // WHEN
    await service.updateGift('gift-1', 'adder-1', { title: 'Vélo', url: LINK, imageUrl: '' });
    // THEN
    expect(savedImage(giftRepo.update)).toBe(OG_IMAGE);
  });

  it('takes the new link image when only the link changes', async () => {
    // GIVEN
    stubLinkPage();
    const { service, giftRepo } = makeService(makeGift({ url: 'https://old.test/x', ogImageUrl: 'https://old.test/og.jpg' }));
    // WHEN
    await service.updateGift('gift-1', 'adder-1', { title: 'Vélo', url: LINK, imageUrl: 'https://old.test/og.jpg' });
    // THEN
    expect(savedImage(giftRepo.update)).toBe(OG_IMAGE);
  });
});
