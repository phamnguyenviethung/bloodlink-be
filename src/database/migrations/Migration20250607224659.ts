import { Migration } from '@mikro-orm/migrations';

export class Migration20250607224659 extends Migration {

  override async up(): Promise<void> {
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

    this.addSql(`alter table "campaign_donation" add column "appointment_date" timestamptz null;`);
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

  override async down(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "campaign_donation" drop column "appointment_date";`);

    this.addSql(`alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);

    this.addSql(`alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "created_at" set default '2025-06-04T04:06:41.483Z';`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-04T04:06:41.484Z';`);
  }

}
