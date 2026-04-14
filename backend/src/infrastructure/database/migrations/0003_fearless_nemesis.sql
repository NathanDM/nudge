ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "pin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_contacts" ADD COLUMN "contact_type" varchar(10) NOT NULL DEFAULT 'friend';--> statement-breakpoint
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_contact_type_check" CHECK (contact_type IN ('family', 'friend'));--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "managed_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_managed_by_name_unique" UNIQUE (managed_by, name);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_managed_by_users_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
