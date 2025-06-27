import { Migration } from '@mikro-orm/migrations';

export class Migration20250623100712 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "blood_type_info" ("group" varchar(255) not null, "rh" varchar(255) not null, "description" text not null, "characteristics" text not null, "can_donate_to" text not null, "can_receive_from" text not null, "frequency" text not null, "special_notes" text null, constraint "blood_type_info_pkey" primary key ("group", "rh"));`,
    );

    this.addSql(
      `alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "blood_compatibility" drop constraint "blood_compatibility_pkey";`,
    );

    // Drop all existing data from blood_compatibility table since we need to restructure it
    this.addSql(`delete from "blood_compatibility";`);

    this.addSql(
      `alter table "blood_compatibility" add column "blood_component_type" varchar(255) not null;`,
    );
    this.addSql(
      `alter table "blood_compatibility" add constraint "blood_compatibility_pkey" primary key ("donor_group", "donor_rh", "recipient_group", "recipient_rh", "blood_component_type");`,
    );

    this.addSql(
      `alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );

    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" set default '2025-06-23T10:07:12.633Z';`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" set default '2025-06-23T10:07:12.633Z';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blood_type_info" cascade;`);

    this.addSql(
      `alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "blood_compatibility" drop constraint "blood_compatibility_pkey";`,
    );
    this.addSql(
      `alter table "blood_compatibility" drop column "blood_component_type";`,
    );

    this.addSql(
      `alter table "blood_compatibility" add constraint "blood_compatibility_pkey" primary key ("donor_group", "donor_rh", "recipient_group", "recipient_rh");`,
    );

    this.addSql(
      `alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );

    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" set default '2025-06-21T04:34:10.934Z';`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" set default '2025-06-21T04:34:10.934Z';`,
    );
  }
}
