import { Migration } from '@mikro-orm/migrations';

export class Migration20250625171823_add_blog_entity extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "blogs" ("id" varchar(255) not null, "created_at" timestamptz not null default '2025-06-25T17:18:23.033Z', "updated_at" timestamptz null default '2025-06-25T17:18:23.034Z', "title" varchar(255) not null, "content" text not null, "excerpt" varchar(500) null, "image_url" varchar(500) null, "slug" varchar(255) not null, "tags" jsonb null, "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'draft', "published_at" timestamptz null, constraint "blogs_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "blogs" add constraint "blogs_slug_unique" unique ("slug");`,
    );
    this.addSql(
      `create index "blogs_created_at_index" on "blogs" ("created_at");`,
    );
    this.addSql(`create index "blogs_status_index" on "blogs" ("status");`);
    this.addSql(`create index "blogs_slug_index" on "blogs" ("slug");`);

    this.addSql(
      `alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "account" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "admin" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "campaign" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "customer" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "campaign_donation" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "blood_unit" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "emergency_request" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "hospital" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "staff" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "emergency_request_log" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "campaign_donation_log" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );

    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "created_at" set default '2025-06-25T17:18:23.033Z';`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`,
    );
    this.addSql(
      `alter table "blood_unit_actions" alter column "updated_at" set default '2025-06-25T17:18:23.034Z';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blogs" cascade;`);

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
}
