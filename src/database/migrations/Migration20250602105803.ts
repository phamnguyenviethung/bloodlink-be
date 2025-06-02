import { Migration } from '@mikro-orm/migrations';

export class Migration20250602105803 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "blood_type" ("group" varchar(255) not null, "rh" varchar(255) not null, constraint "blood_type_pkey" primary key ("group", "rh"));`);

    this.addSql(`create table "blood_compatibility" ("donor_group" varchar(255) not null, "donor_rh" varchar(255) not null, "recipient_group" varchar(255) not null, "recipient_rh" varchar(255) not null, constraint "blood_compatibility_pkey" primary key ("donor_group", "donor_rh", "recipient_group", "recipient_rh"));`);

    this.addSql(`alter table "blood_compatibility" add constraint "blood_compatibility_donor_group_donor_rh_foreign" foreign key ("donor_group", "donor_rh") references "blood_type" ("group", "rh") on update cascade;`);
    this.addSql(`alter table "blood_compatibility" add constraint "blood_compatibility_recipient_group_recipient_rh_foreign" foreign key ("recipient_group", "recipient_rh") references "blood_type" ("group", "rh") on update cascade;`);

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

  override async down(): Promise<void> {
    this.addSql(`alter table "blood_compatibility" drop constraint "blood_compatibility_donor_group_donor_rh_foreign";`);

    this.addSql(`alter table "blood_compatibility" drop constraint "blood_compatibility_recipient_group_recipient_rh_foreign";`);

    this.addSql(`drop table if exists "blood_type" cascade;`);

    this.addSql(`drop table if exists "blood_compatibility" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-02T06:34:07.585Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-02T06:34:07.586Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-02T06:34:07.585Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-02T06:34:07.586Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-02T06:34:07.585Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-02T06:34:07.586Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-02T06:34:07.585Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-02T06:34:07.586Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-02T06:34:07.585Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-02T06:34:07.586Z';`);
  }

}
