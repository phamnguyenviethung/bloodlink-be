import { Migration } from '@mikro-orm/migrations';

export class Migration20250727144100_add_is_blood_unit_created_field_manual extends Migration {
  override async up(): Promise<void> {
    // Add isBloodUnitCreated field to campaign_donation table
    this.addSql(
      `ALTER TABLE "campaign_donation" ADD COLUMN "is_blood_unit_created" boolean NOT NULL DEFAULT false;`,
    );
  }

  override async down(): Promise<void> {
    // Remove isBloodUnitCreated field from campaign_donation table
    this.addSql(
      `ALTER TABLE "campaign_donation" DROP COLUMN "is_blood_unit_created";`,
    );
  }
}
