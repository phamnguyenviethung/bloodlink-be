import { Migration } from '@mikro-orm/migrations';

export class Migration20250615180534 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "blood_unit" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-15T18:05:34.255Z', "updated_at" timestamptz null default '2025-06-15T18:05:34.255Z', "member_id" varchar(255) not null, "blood_type_group" varchar(255) not null, "blood_type_rh" varchar(255) not null, "blood_volume" int not null, "remaining_volume" int not null, "expired_date" timestamptz not null, "status" text check ("status" in ('available', 'used', 'expired', 'transferred', 'reserved', 'damaged')) not null default 'available', constraint "blood_unit_pkey" primary key ("id"));`);
    this.addSql(`alter table "blood_unit" add constraint "blood_unit_blood_type_group_blood_type_rh_unique" unique ("blood_type_group", "blood_type_rh");`);

    this.addSql(`create table "blood_unit_actions" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-15T18:05:34.255Z', "updated_at" timestamptz null default '2025-06-15T18:05:34.255Z', "blood_unit_id" varchar(255) not null, "staff_id" varchar(255) not null, "action" text check ("action" in ('status_update', 'volume_change', 'transfer', 'reservation', 'damage_report')) not null, "description" varchar(255) null, "previous_value" varchar(255) null, "new_value" varchar(255) null, constraint "blood_unit_actions_pkey" primary key ("id"));`);

    this.addSql(`alter table "blood_unit" add constraint "blood_unit_member_id_foreign" foreign key ("member_id") references "customer" ("id") on update cascade;`);
    this.addSql(`alter table "blood_unit" add constraint "blood_unit_blood_type_group_blood_type_rh_foreign" foreign key ("blood_type_group", "blood_type_rh") references "blood_type" ("group", "rh") on update cascade;`);

    this.addSql(`alter table "blood_unit_actions" add constraint "blood_unit_actions_blood_unit_id_foreign" foreign key ("blood_unit_id") references "blood_unit" ("id") on update cascade;`);
    this.addSql(`alter table "blood_unit_actions" add constraint "blood_unit_actions_staff_id_foreign" foreign key ("staff_id") references "staff" ("id") on update cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-06-15T18:05:34.255Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-15T18:05:34.255Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "blood_unit_actions" drop constraint "blood_unit_actions_blood_unit_id_foreign";`);

    this.addSql(`drop table if exists "blood_unit" cascade;`);

    this.addSql(`drop table if exists "blood_unit_actions" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-06-07T22:46:59.541Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-07T22:46:59.542Z';`);
  }

}
