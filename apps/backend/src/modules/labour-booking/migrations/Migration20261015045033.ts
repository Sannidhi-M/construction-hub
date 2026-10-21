import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261015045033 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "labour_booking" ("id" text not null, "service_slug" text not null, "service_name" text not null, "rate_type" text check ("rate_type" in ('day', 'hour')) not null, "rate_amount" integer not null, "start_date" text null, "end_date" text null, "scheduled_time" text null, "duration_hours" integer null, "num_workers" integer not null, "address_1" text not null, "landmark" text null, "city" text not null, "postal_code" text not null, "phone" text not null, "customer_id" text null, "email" text null, "payment_method" text check ("payment_method" in ('upi', 'cod')) not null, "payment_confirmed" boolean not null default false, "status" text check ("status" in ('requested', 'confirmed', 'completed', 'cancelled')) not null default 'requested', "admin_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "labour_booking_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_labour_booking_deleted_at" ON "labour_booking" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "labour_booking" cascade;`);
  }

}
