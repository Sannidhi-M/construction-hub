import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261025145928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "contact_message" alter column "phone" type text using ("phone"::text);`);
    this.addSql(`alter table if exists "contact_message" alter column "phone" set not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "contact_message" alter column "phone" type text using ("phone"::text);`);
    this.addSql(`alter table if exists "contact_message" alter column "phone" drop not null;`);
  }

}
