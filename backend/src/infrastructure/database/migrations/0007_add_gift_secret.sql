ALTER TABLE "gift_ideas" ADD COLUMN IF NOT EXISTS "secret" boolean NOT NULL DEFAULT false;
