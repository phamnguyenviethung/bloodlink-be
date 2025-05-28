import { Migration } from '@mikro-orm/migrations';

export class Migration20250528031834 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "account" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-28T03:18:32.800Z', "updated_at" timestamptz null default '2025-05-28T03:18:32.801Z', "first_name" varchar(255) null, "last_name" varchar(255) null, "email" varchar(255) not null, "role" text check ("role" in ('admin', 'user', 'staff', 'hospital')) not null, constraint "account_pkey" primary key ("id"));`);
    this.addSql(`alter table "account" add constraint "account_email_unique" unique ("email");`);

    this.addSql(`create table "admin" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-28T03:18:32.800Z', "updated_at" timestamptz null default '2025-05-28T03:18:32.801Z', "account_id" varchar(255) not null, constraint "admin_pkey" primary key ("id"));`);
    this.addSql(`alter table "admin" add constraint "admin_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "customer" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-28T03:18:32.800Z', "updated_at" timestamptz null default '2025-05-28T03:18:32.801Z', "account_id" varchar(255) not null, "phone" varchar(255) null, "longitude" varchar(255) null, "latitude" varchar(255) null, "ward_code" varchar(255) null, "district_code" varchar(255) null, "province_code" varchar(255) null, "ward_name" varchar(255) null, "district_name" varchar(255) null, "province_name" varchar(255) null, "status" varchar(255) null default 'active', constraint "customer_pkey" primary key ("id"));`);
    this.addSql(`alter table "customer" add constraint "customer_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "hospital" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-28T03:18:32.800Z', "updated_at" timestamptz null default '2025-05-28T03:18:32.801Z', "account_id" varchar(255) not null, "name" varchar(255) not null, "phone" varchar(255) null, "longitude" int not null, "latitude" int not null, "ward_code" varchar(255) not null, "district_code" varchar(255) not null, "province_code" varchar(255) not null, "ward_name" varchar(255) not null, "district_name" varchar(255) not null, "province_name" varchar(255) not null, "status" varchar(255) null default 'active', constraint "hospital_pkey" primary key ("id"));`);
    this.addSql(`alter table "hospital" add constraint "hospital_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "staff" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-28T03:18:32.800Z', "updated_at" timestamptz null default '2025-05-28T03:18:32.801Z', "account_id" varchar(255) not null, "role" text check ("role" in ('mentor')) not null, constraint "staff_pkey" primary key ("id"));`);
    this.addSql(`alter table "staff" add constraint "staff_account_id_unique" unique ("account_id");`);

    this.addSql(`alter table "admin" add constraint "admin_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "customer" add constraint "customer_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "hospital" add constraint "hospital_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "staff" add constraint "staff_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);
  }

}
