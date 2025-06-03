import { Migration } from '@mikro-orm/migrations';

export class Migration20250603063418 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "campaign" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-03T06:34:18.106Z', "updated_at" timestamptz null default '2025-06-03T06:34:18.107Z', "name" varchar(255) not null, "description" varchar(255) null default '', "start_date" timestamptz not null, "end_date" timestamptz not null, "status" text check ("status" in ('active', 'not_started', 'ended')) not null default 'not_started', "banner" varchar(255) null default '', constraint "campaign_pkey" primary key ("id"));`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-03T06:34:18.106Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-03T06:34:18.107Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-03T06:34:18.106Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-03T06:34:18.107Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-03T06:34:18.106Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-03T06:34:18.107Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-03T06:34:18.106Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-03T06:34:18.107Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-03T06:34:18.106Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-03T06:34:18.107Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "campaign" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-02T10:58:03.763Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-02T10:58:03.764Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-02T10:58:03.763Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-02T10:58:03.764Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-02T10:58:03.763Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-02T10:58:03.764Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-02T10:58:03.763Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-02T10:58:03.764Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-02T10:58:03.763Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-02T10:58:03.764Z';`);
  }

}
