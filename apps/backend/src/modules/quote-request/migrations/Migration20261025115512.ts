import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261025115512 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quote_request" ("id" text not null, "service_slug" text not null, "service_name" text not null, "name" text not null, "email" text not null, "phone" text not null, "notes" text null, "customer_id" text not null, "status" text check ("status" in ('new', 'contacted', 'quoted', 'closed')) not null default 'new', "admin_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_deleted_at" ON "quote_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "quote_request" cascade;`);
  }

}
