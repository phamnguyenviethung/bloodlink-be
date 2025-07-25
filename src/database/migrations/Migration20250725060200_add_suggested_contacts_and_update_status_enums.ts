import { Migration } from '@mikro-orm/migrations';

export class Migration20250725060200_add_suggested_contacts_and_update_status_enums extends Migration {
  override async up(): Promise<void> {
    // Add the suggestedContacts field as JSONB
    this.addSql(
      `alter table "emergency_request" add column "suggested_contacts" jsonb null;`,
    );

    // Update emergency request status enum to include 'contacts_provided'
    this.addSql(
      `alter table "emergency_request" drop constraint if exists "emergency_request_status_check";`,
    );
    this.addSql(
      `alter table "emergency_request" add constraint "emergency_request_status_check" check("status" in ('pending', 'approved', 'rejected', 'contacts_provided'));`,
    );

    // Update emergency request log status enum to include new statuses
    this.addSql(
      `alter table "emergency_request_log" drop constraint if exists "emergency_request_log_status_check";`,
    );
    this.addSql(
      `alter table "emergency_request_log" add constraint "emergency_request_log_status_check" check("status" in ('status_update', 'blood_unit_assigned', 'volume_change', 'location_change', 'contacts_provided', 'rejection', 'multiple_rejections', 'approval'));`,
    );
  }

  override async down(): Promise<void> {
    // Remove the suggestedContacts field
    this.addSql(
      `alter table "emergency_request" drop column if exists "suggested_contacts";`,
    );

    // Revert emergency request status enum
    this.addSql(
      `alter table "emergency_request" drop constraint if exists "emergency_request_status_check";`,
    );
    this.addSql(
      `alter table "emergency_request" add constraint "emergency_request_status_check" check("status" in ('pending', 'approved', 'rejected'));`,
    );

    // Revert emergency request log status enum
    this.addSql(
      `alter table "emergency_request_log" drop constraint if exists "emergency_request_log_status_check";`,
    );
    this.addSql(
      `alter table "emergency_request_log" add constraint "emergency_request_log_status_check" check("status" in ('status_update', 'blood_unit_assigned', 'volume_change', 'location_change'));`,
    );
  }
}
