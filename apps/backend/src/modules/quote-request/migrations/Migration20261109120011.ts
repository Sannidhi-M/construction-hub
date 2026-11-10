import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261109120011 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "quote_request" drop constraint if exists "quote_request_customer_id_unique";`);
    this.addSql(`alter table if exists "quote_request" add column if not exists "is_free_claim" boolean not null default false;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_quote_request_customer_id_unique" ON "quote_request" ("customer_id") WHERE is_free_claim = true AND deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_quote_request_customer_id_unique";`);
    this.addSql(`alter table if exists "quote_request" drop column if exists "is_free_claim";`);
  }

}
