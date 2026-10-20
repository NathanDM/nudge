import { BadRequestException } from '@nestjs/common';

const MAX_LENGTH = 1000;

export type ImageEdit = { requested: string | null; current: string | null; linkChanged: boolean };

export function parseImageUrl(raw?: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value.length > MAX_LENGTH || !/^https?:\/\//i.test(value))
    throw new BadRequestException("URL d'image invalide");
  return value;
}

export function needsLinkImage({ requested, current, linkChanged }: ImageEdit): boolean {
  if (requested && requested !== current) return false;
  return linkChanged || requested !== current;
}
