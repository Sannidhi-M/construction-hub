import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261015045207 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "labour_booking" add column if not exists "payment_received" boolean not null default false;`);
    this.addSql(`alter table if exists "labour_booking" rename column "payment_confirmed" to "payment_customer_confirmed";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "labour_booking" drop column if exists "payment_received";`);

    this.addSql(`alter table if exists "labour_booking" rename column "payment_customer_confirmed" to "payment_confirmed";`);
  }

}
