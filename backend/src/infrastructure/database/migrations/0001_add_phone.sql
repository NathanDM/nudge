ALTER TABLE "users" ADD COLUMN "phone" varchar(20) NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "pin" TYPE varchar(4);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "pin" DROP DEFAULT;
