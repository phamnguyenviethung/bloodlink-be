import { Migration } from '@mikro-orm/migrations';

export class Migration20250526032052 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "account" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-26T03:20:50.628Z', "updated_at" timestamptz null default '2025-05-26T03:20:50.628Z', "first_name" varchar(255) null, "last_name" varchar(255) null, "email" varchar(255) not null, "role" text check ("role" in ('admin', 'user', 'staff')) not null, constraint "account_pkey" primary key ("id"));`);
    this.addSql(`alter table "account" add constraint "account_email_unique" unique ("email");`);

    this.addSql(`create table "admin" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-26T03:20:50.628Z', "updated_at" timestamptz null default '2025-05-26T03:20:50.628Z', "account_id" varchar(255) not null, constraint "admin_pkey" primary key ("id"));`);
    this.addSql(`alter table "admin" add constraint "admin_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "customer" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-26T03:20:50.628Z', "updated_at" timestamptz null default '2025-05-26T03:20:50.628Z', "account_id" varchar(255) not null, "balance" int not null default 0, constraint "customer_pkey" primary key ("id"));`);
    this.addSql(`alter table "customer" add constraint "customer_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "staff" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-05-26T03:20:50.628Z', "updated_at" timestamptz null default '2025-05-26T03:20:50.628Z', "account_id" varchar(255) not null, "role" text check ("role" in ('mentor')) not null, constraint "staff_pkey" primary key ("id"));`);
    this.addSql(`alter table "staff" add constraint "staff_account_id_unique" unique ("account_id");`);

    this.addSql(`alter table "admin" add constraint "admin_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "customer" add constraint "customer_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "staff" add constraint "staff_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);
  }

}
