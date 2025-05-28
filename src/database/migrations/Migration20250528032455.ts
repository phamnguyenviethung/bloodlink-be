import { Migration } from '@mikro-orm/migrations';

export class Migration20250528032455 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-05-28T03:24:55.649Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-05-28T03:24:55.649Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-05-28T03:24:55.649Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "hospital" alter column "longitude" type varchar(255) using ("longitude"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "longitude" drop not null;`);
    this.addSql(`alter table "hospital" alter column "latitude" type varchar(255) using ("latitude"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "latitude" drop not null;`);
    this.addSql(`alter table "hospital" alter column "ward_code" type varchar(255) using ("ward_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "ward_code" drop not null;`);
    this.addSql(`alter table "hospital" alter column "district_code" type varchar(255) using ("district_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "district_code" drop not null;`);
    this.addSql(`alter table "hospital" alter column "province_code" type varchar(255) using ("province_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "province_code" drop not null;`);
    this.addSql(`alter table "hospital" alter column "ward_name" type varchar(255) using ("ward_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "ward_name" drop not null;`);
    this.addSql(`alter table "hospital" alter column "district_name" type varchar(255) using ("district_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "district_name" drop not null;`);
    this.addSql(`alter table "hospital" alter column "province_name" type varchar(255) using ("province_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "province_name" drop not null;`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-05-28T03:24:55.649Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-05-28T03:24:55.649Z';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "created_at" set default '2025-05-28T03:18:32.800Z';`);
    this.addSql(`alter table "account" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "account" alter column "updated_at" set default '2025-05-28T03:18:32.801Z';`);

    this.addSql(`alter table "admin" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "created_at" set default '2025-05-28T03:18:32.800Z';`);
    this.addSql(`alter table "admin" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "admin" alter column "updated_at" set default '2025-05-28T03:18:32.801Z';`);

    this.addSql(`alter table "customer" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "created_at" set default '2025-05-28T03:18:32.800Z';`);
    this.addSql(`alter table "customer" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "customer" alter column "updated_at" set default '2025-05-28T03:18:32.801Z';`);

    this.addSql(`alter table "hospital" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "created_at" set default '2025-05-28T03:18:32.800Z';`);
    this.addSql(`alter table "hospital" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "hospital" alter column "updated_at" set default '2025-05-28T03:18:32.801Z';`);
    this.addSql(`alter table "hospital" alter column "longitude" type int using ("longitude"::int);`);
    this.addSql(`alter table "hospital" alter column "longitude" set not null;`);
    this.addSql(`alter table "hospital" alter column "latitude" type int using ("latitude"::int);`);
    this.addSql(`alter table "hospital" alter column "latitude" set not null;`);
    this.addSql(`alter table "hospital" alter column "ward_code" type varchar(255) using ("ward_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "ward_code" set not null;`);
    this.addSql(`alter table "hospital" alter column "district_code" type varchar(255) using ("district_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "district_code" set not null;`);
    this.addSql(`alter table "hospital" alter column "province_code" type varchar(255) using ("province_code"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "province_code" set not null;`);
    this.addSql(`alter table "hospital" alter column "ward_name" type varchar(255) using ("ward_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "ward_name" set not null;`);
    this.addSql(`alter table "hospital" alter column "district_name" type varchar(255) using ("district_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "district_name" set not null;`);
    this.addSql(`alter table "hospital" alter column "province_name" type varchar(255) using ("province_name"::varchar(255));`);
    this.addSql(`alter table "hospital" alter column "province_name" set not null;`);

    this.addSql(`alter table "staff" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "created_at" set default '2025-05-28T03:18:32.800Z';`);
    this.addSql(`alter table "staff" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "staff" alter column "updated_at" set default '2025-05-28T03:18:32.801Z';`);
  }

}
