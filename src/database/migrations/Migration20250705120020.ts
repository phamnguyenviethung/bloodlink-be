import { Migration } from '@mikro-orm/migrations';

export class Migration20250705120020 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "emergency_request_log" drop constraint "emergency_request_log_account_id_foreign";`);

    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "emergency_request_log" drop column "account_id";`);

    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "donation_result_template" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "donation_result_template" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "donation_result_template_item" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "donation_result_template_item" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "donation_result_template_item_option" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-05T12:00:20.429Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-05T12:00:20.429Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "blogs" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "blogs" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blogs" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "emergency_request_log" add column "account_id" varchar(255) null;`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "emergency_request_log" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);
    this.addSql(`alter table "emergency_request_log" add constraint "emergency_request_log_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "donation_result_template" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "donation_result_template" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "donation_result_template_item" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "donation_result_template_item" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "donation_result_template_item_option" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result_template_item_option" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "donation_result" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "donation_result" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "donation_result" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);

    this.addSql(`alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "created_at" set default '2025-07-05T11:49:44.229Z';`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "blood_unit_actions" alter column "updated_at" set default '2025-07-05T11:49:44.230Z';`);
  }

}
