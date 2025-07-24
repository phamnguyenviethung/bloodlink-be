import { Migration } from '@mikro-orm/migrations';

export class Migration20250724173000_add_avatar_fields extends Migration {
  override async up(): Promise<void> {
    // Add avatar column to Customer table
    this.addSql(
      `alter table "customer" add column "avatar" varchar(255) null;`,
    );

    // Add avatar column to Staff table
    this.addSql(`alter table "staff" add column "avatar" varchar(255) null;`);

    // Add avatar column to Admin table
    this.addSql(`alter table "admin" add column "avatar" varchar(255) null;`);

    // Add avatar column to Hospital table
    this.addSql(
      `alter table "hospital" add column "avatar" varchar(255) null;`,
    );
  }

  override async down(): Promise<void> {
    // Remove avatar column from Customer table
    this.addSql(`alter table "customer" drop column "avatar";`);

    // Remove avatar column from Staff table
    this.addSql(`alter table "staff" drop column "avatar";`);

    // Remove avatar column from Admin table
    this.addSql(`alter table "admin" drop column "avatar";`);

    // Remove avatar column from Hospital table
    this.addSql(`alter table "hospital" drop column "avatar";`);
  }
}
