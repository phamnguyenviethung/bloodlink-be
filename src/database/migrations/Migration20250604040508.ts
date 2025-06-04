import { Migration } from '@mikro-orm/migrations';

export class Migration20250604040508 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "campaign_donation" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-04T04:05:08.834Z', "updated_at" timestamptz null default '2025-06-04T04:05:08.835Z', "campaign_id" varchar(255) not null, "donor_id" varchar(255) not null, "current_status" text check ("current_status" in ('pending', 'completed', 'failed')) not null default 'pending', constraint "campaign_donation_pkey" primary key ("id"));`);

    this.addSql(`create table "campaign_donation_log" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-04T04:05:08.834Z', "updated_at" timestamptz null default '2025-06-04T04:05:08.835Z', "campaign_donation_id" varchar(255) not null, "status" text check ("status" in ('pending', 'completed', 'failed')) not null, "note" varchar(255) null default '', "staff_id" varchar(255) null, constraint "campaign_donation_log_pkey" primary key ("id"));`);
    this.addSql(`alter table "campaign_donation_log" add constraint "campaign_donation_log_staff_id_unique" unique ("staff_id");`);

    this.addSql(`alter table "campaign_donation" add constraint "campaign_donation_campaign_id_foreign" foreign key ("campaign_id") references "campaign" ("id") on update cascade;`);
    this.addSql(`alter table "campaign_donation" add constraint "campaign_donation_donor_id_foreign" foreign key ("donor_id") references "customer" ("id") on update cascade;`);

    this.addSql(`alter table "campaign_donation_log" add constraint "campaign_donation_log_campaign_donation_id_foreign" foreign key ("campaign_donation_id") references "campaign_donation" ("id") on update cascade;`);
    this.addSql(`alter table "campaign_donation_log" add constraint "campaign_donation_log_staff_id_foreign" foreign key ("staff_id") references "staff" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-04T04:05:08.834Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-04T04:05:08.835Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "campaign_donation_log" drop constraint "campaign_donation_log_campaign_donation_id_foreign";`);

    this.addSql(`drop table if exists "campaign_donation" cascade;`);

    this.addSql(`drop table if exists "campaign_donation_log" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-03T11:54:59.276Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-03T11:54:59.276Z';`);
  }

}
