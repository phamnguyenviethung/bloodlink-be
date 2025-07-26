import { Migration } from '@mikro-orm/migrations';

export class Migration20250726061303 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "customer" add column "can_change_blood_type" boolean not null default true;`);
    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "donation_reminder" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-26T06:13:03.673Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-26T06:13:03.674Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "customer" drop column "can_change_blood_type";`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "donation_reminder" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_reminder" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-25T14:00:17.777Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-25T14:00:17.778Z';`);
  }

}
