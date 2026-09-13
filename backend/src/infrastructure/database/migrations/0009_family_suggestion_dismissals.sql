CREATE TABLE IF NOT EXISTS "family_suggestion_dismissals" (
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"contact_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "family_suggestion_dismissals_pk" PRIMARY KEY("user_id","contact_id")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_contacts_contact_type" ON "user_contacts" ("contact_id", "contact_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_managed_by" ON "users" ("managed_by") WHERE "managed_by" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_contacts_user_type" ON "user_contacts" ("user_id", "contact_type");
