import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261105060108 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "labour_service" drop constraint if exists "labour_service_slug_unique";`);
    this.addSql(`create table if not exists "labour_service" ("id" text not null, "slug" text not null, "name" text not null, "category" text check ("category" in ('Construction', 'Finishing', 'General')) not null, "description" text not null, "per_day_rate" integer not null, "per_hour_rate" integer not null, "min_booking_hours" integer not null, "image_url" text null, "is_active" boolean not null default true, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "labour_service_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_labour_service_slug_unique" ON "labour_service" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_labour_service_deleted_at" ON "labour_service" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "labour_service" cascade;`);
  }

}
