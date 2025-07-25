import { Migration } from '@mikro-orm/migrations';

export class Migration20250725140017_add_expired_status_to_emergency_request extends Migration {
  override async up(): Promise<void> {
    // Drop the existing constraint
    this.addSql(
      `alter table "emergency_request" drop constraint if exists "emergency_request_status_check";`,
    );

    // Add the constraint with the 'expired' status included
    this.addSql(
      `alter table "emergency_request" add constraint "emergency_request_status_check" check("status" in ('pending', 'approved', 'rejected', 'contacts_provided', 'expired'));`,
    );
  }

  override async down(): Promise<void> {
    // Drop the constraint with 'expired' status
    this.addSql(
      `alter table "emergency_request" drop constraint if exists "emergency_request_status_check";`,
    );

    // Add back the constraint without 'expired' status
    this.addSql(
      `alter table "emergency_request" add constraint "emergency_request_status_check" check("status" in ('pending', 'approved', 'rejected', 'contacts_provided'));`,
    );
  }
}
