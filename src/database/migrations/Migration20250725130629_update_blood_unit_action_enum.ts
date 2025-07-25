import { Migration } from '@mikro-orm/migrations';

export class Migration20250725130629_update_blood_unit_action_enum extends Migration {
  override async up(): Promise<void> {
    // Update BloodUnitAction enum to include new action types
    this.addSql(
      `alter table "blood_unit_actions" drop constraint if exists "blood_unit_actions_action_check";`,
    );
    this.addSql(
      `alter table "blood_unit_actions" add constraint "blood_unit_actions_action_check" check("action" in ('status_update', 'volume_change', 'components_separated', 'whole_blood_created'));`,
    );
  }

  override async down(): Promise<void> {
    // Revert BloodUnitAction enum to previous state (if needed)
    this.addSql(
      `alter table "blood_unit_actions" drop constraint if exists "blood_unit_actions_action_check";`,
    );
    this.addSql(
      `alter table "blood_unit_actions" add constraint "blood_unit_actions_action_check" check("action" in ('status_update', 'volume_change'));`,
    );
  }
}
