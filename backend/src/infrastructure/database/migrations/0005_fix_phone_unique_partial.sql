UPDATE "users" SET "phone" = NULL WHERE "phone" = '';

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_phone_unique";

CREATE UNIQUE INDEX "users_phone_unique" ON "users" ("phone") WHERE "phone" IS NOT NULL;
