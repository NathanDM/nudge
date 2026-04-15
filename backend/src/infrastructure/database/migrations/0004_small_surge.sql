ALTER TABLE "gift_ideas" ADD COLUMN "claimed_anonymously" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "share_token" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_share_token_unique" UNIQUE("share_token");