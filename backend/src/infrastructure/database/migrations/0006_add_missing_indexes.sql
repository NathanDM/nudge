CREATE INDEX IF NOT EXISTS "idx_users_managed_by" ON "users" ("managed_by") WHERE "managed_by" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_user_contacts_user_type" ON "user_contacts" ("user_id", "contact_type");
