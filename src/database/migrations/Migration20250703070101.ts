import { Migration } from '@mikro-orm/migrations';

export class Migration20250703070101 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "donation_result_template" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-03T07:01:01.356Z', "updated_at" timestamptz null default '2025-07-03T07:01:01.357Z', "name" varchar(255) not null, "description" varchar(255) null default '', "active" boolean not null default true, "created_by_id" varchar(255) not null, "updated_by_id" varchar(255) not null, constraint "donation_result_template_pkey" primary key ("id"));`);

    this.addSql(`create table "donation_result_template_item" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-03T07:01:01.356Z', "updated_at" timestamptz null default '2025-07-03T07:01:01.357Z', "template_id" varchar(255) not null, "type" text check ("type" in ('number', 'date', 'checkbox', 'radio', 'select', 'textarea', 'link', 'text')) not null, "label" varchar(255) not null, "description" varchar(255) null default '', "placeholder" varchar(255) null default '', "default_value" varchar(255) null default '', "sort_order" int not null, "min_value" int null, "max_value" int null, "min_length" int null, "max_length" int null, "is_required" boolean not null default true, "pattern" varchar(255) null default '', "options" text[] null, constraint "donation_result_template_item_pkey" primary key ("id"));`);

    this.addSql(`create table "donation_result_template_item_option" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-03T07:01:01.356Z', "updated_at" timestamptz null default '2025-07-03T07:01:01.357Z', "item_id" varchar(255) not null, "label" varchar(255) not null, constraint "donation_result_template_item_option_pkey" primary key ("id"));`);

    this.addSql(`alter table "donation_result_template" add constraint "donation_result_template_created_by_id_foreign" foreign key ("created_by_id") references "staff" ("id") on update cascade;`);
    this.addSql(`alter table "donation_result_template" add constraint "donation_result_template_updated_by_id_foreign" foreign key ("updated_by_id") references "staff" ("id") on update cascade;`);

    this.addSql(`alter table "donation_result_template_item" add constraint "donation_result_template_item_template_id_foreign" foreign key ("template_id") references "donation_result_template" ("id") on update cascade;`);

    this.addSql(`alter table "donation_result_template_item_option" add constraint "donation_result_template_item_option_item_id_foreign" foreign key ("item_id") references "donation_result_template_item" ("id") on update cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-03T07:01:01.356Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-03T07:01:01.357Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "donation_result_template_item" drop constraint "donation_result_template_item_template_id_foreign";`);

    this.addSql(`alter table "donation_result_template_item_option" drop constraint "donation_result_template_item_option_item_id_foreign";`);

    this.addSql(`drop table if exists "donation_result_template" cascade;`);

    this.addSql(`drop table if exists "donation_result_template_item" cascade;`);

    this.addSql(`drop table if exists "donation_result_template_item_option" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-03T07:00:30.449Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-03T07:00:30.450Z';`);
  }

}
