import { Migration } from '@mikro-orm/migrations';

export class Migration20250527024555 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "hospital" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-27T02:45:55.192Z', "updated_at" timestamptz null default '2025-05-27T02:45:55.192Z', "account_id" varchar(255) not null, "name" varchar(255) not null, "phone" varchar(255) null, "longitude" int not null, "latitude" int not null, "ward_code" varchar(255) not null, "district_code" varchar(255) not null, "province_code" varchar(255) not null, "ward_name" varchar(255) not null, "district_name" varchar(255) not null, "province_name" varchar(255) not null, "status" varchar(255) null default 'active', constraint "hospital_pkey" primary key ("id"));`);
    this.addSql(`alter table "hospital" add constraint "hospital_account_id_unique" unique ("account_id");`);

    this.addSql(`alter table "hospital" add constraint "hospital_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-05-27T02:45:55.192Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-05-27T02:45:55.192Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-05-27T02:45:55.192Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-05-27T02:45:55.192Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-05-27T02:45:55.192Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-05-27T02:45:55.192Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-05-27T02:45:55.192Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-05-27T02:45:55.192Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hospital" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-05-26T03:20:50.628Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-05-26T03:20:50.628Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-05-26T03:20:50.628Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-05-26T03:20:50.628Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-05-26T03:20:50.628Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-05-26T03:20:50.628Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-05-26T03:20:50.628Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-05-26T03:20:50.628Z';`);
  }

}
