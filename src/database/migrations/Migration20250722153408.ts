import { Migration } from '@mikro-orm/migrations';

export class Migration20250722153408 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "donation_result_template_item" drop constraint "donation_result_template_item_template_id_foreign";`);

    this.addSql(`alter table "donation_result_template_item_option" drop constraint "donation_result_template_item_option_item_id_foreign";`);

    this.addSql(`drop table if exists "donation_result_template" cascade;`);

    this.addSql(`drop table if exists "donation_result_template_item" cascade;`);

    this.addSql(`drop table if exists "donation_result_template_item_option" cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "donation_reminder" drop column "status";`);

    this.addSql(`alter table "donation_reminder" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "donation_result" drop column "blood_test_results", drop column "template", drop column "result_date";`);

    this.addSql(`alter table "donation_result" add column "volume_ml" int not null, add column "blood_type" varchar(255) not null, add column "blood_group" varchar(255) not null, add column "blood_rh" varchar(255) not null, add column "reject_reason" varchar(255) null default '', add column "status" text check ("status" in ('rejected', 'completed')) not null default 'rejected';`);
    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-22T15:34:08.206Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-22T15:34:08.207Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table "donation_result_template" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-17T10:11:57.121Z', "updated_at" timestamptz null default '2025-07-17T10:11:57.121Z', "name" varchar(255) not null, "description" varchar(255) null default '', "active" boolean not null default true, "created_by_id" varchar(255) not null, "updated_by_id" varchar(255) not null, constraint "donation_result_template_pkey" primary key ("id"));`);

    this.addSql(`create table "donation_result_template_item" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-17T10:11:57.121Z', "updated_at" timestamptz null default '2025-07-17T10:11:57.121Z', "template_id" varchar(255) not null, "type" text check ("type" in ('number', 'date', 'checkbox', 'radio', 'select', 'textarea', 'link', 'text')) not null, "label" varchar(255) not null, "description" varchar(255) null default '', "placeholder" varchar(255) null default '', "default_value" varchar(255) null default '', "sort_order" int not null, "min_value" int null, "max_value" int null, "min_length" int null, "max_length" int null, "is_required" boolean not null default true, "pattern" varchar(255) null default '', constraint "donation_result_template_item_pkey" primary key ("id"));`);

    this.addSql(`create table "donation_result_template_item_option" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-07-17T10:11:57.121Z', "updated_at" timestamptz null default '2025-07-17T10:11:57.121Z', "item_id" varchar(255) not null, "label" varchar(255) not null, constraint "donation_result_template_item_option_pkey" primary key ("id"));`);

    this.addSql(`alter table "donation_result_template" add constraint "donation_result_template_created_by_id_foreign" foreign key ("created_by_id") references "staff" ("id") on update cascade;`);
    this.addSql(`alter table "donation_result_template" add constraint "donation_result_template_updated_by_id_foreign" foreign key ("updated_by_id") references "staff" ("id") on update cascade;`);

    this.addSql(`alter table "donation_result_template_item" add constraint "donation_result_template_item_template_id_foreign" foreign key ("template_id") references "donation_result_template" ("id") on update cascade;`);

    this.addSql(`alter table "donation_result_template_item_option" add constraint "donation_result_template_item_option_item_id_foreign" foreign key ("item_id") references "donation_result_template_item" ("id") on update cascade;`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "donation_reminder" add column "status" text check ("status" in ('pending', 'sent', 'failed')) not null default 'pending';`);
    this.addSql(`alter table "donation_reminder" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-16T11:56:39.584Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-16T11:56:39.585Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "donation_result" drop column "volume_ml", drop column "blood_type", drop column "blood_group", drop column "blood_rh", drop column "reject_reason", drop column "status";`);

    this.addSql(`alter table "donation_result" add column "blood_test_results" jsonb null, add column "template" jsonb null, add column "result_date" timestamptz null;`);
    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-17T10:11:57.121Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-17T10:11:57.121Z';`);
  }

}
