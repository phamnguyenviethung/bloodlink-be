import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { Account, Staff } from './Account.entity';
import { AppBaseEntity } from './base.entity';
import { BloodType } from './Blood.entity';
import { BloodUnit } from './inventory.entity';

export enum EmergencyRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONTACTS_PROVIDED = 'contacts_provided',
}

export enum BloodTypeComponent {
  PLASMA = 'plasma',
  PLATELETS = 'platelets',
  RED_CELLS = 'red_cells',
  WHOLE_BLOOD = 'whole_blood',
}

export enum EmergencyRequestLogStatus {
  STATUS_UPDATE = 'status_update',
  BLOOD_UNIT_ASSIGNED = 'blood_unit_assigned',
  VOLUME_CHANGE = 'volume_change',
  LOCATION_CHANGE = 'location_change',
  CONTACTS_PROVIDED = 'contacts_provided',
  REJECTION = 'rejection',
  MULTIPLE_REJECTIONS = 'multiple_rejections',
  APPROVAL = 'approval',
}

@Entity()
export class EmergencyRequest extends AppBaseEntity {
  @ManyToOne({ entity: () => Account })
  requestedBy: Account;
  @ManyToOne({ entity: () => BloodUnit, nullable: true })
  bloodUnit: BloodUnit | null;

  @Property()
  usedVolume: number;

  @Property()
  requiredVolume: number;

  @ManyToOne(() => BloodType)
  bloodType: BloodType;

  @Enum({ items: () => BloodTypeComponent, nullable: true })
  bloodTypeComponent?: BloodTypeComponent;

  @Enum(() => EmergencyRequestStatus)
  status: EmergencyRequestStatus = EmergencyRequestStatus.PENDING;

  @Property({ nullable: true, default: null })
  description?: string;

  @Property({ nullable: true, default: null })
  rejectionReason?: string;

  @Property()
  startDate: Date = new Date();

  @Property()
  endDate: Date;

  @Property({ nullable: true, default: null })
  wardCode: string | null = null;

  @Property({ nullable: true, default: null })
  districtCode: string | null = null;

  @Property({ nullable: true, default: null })
  provinceCode: string | null = null;

  @Property({ nullable: true, default: null })
  wardName: string | null = null;

  @Property({ nullable: true, default: null })
  districtName: string | null = null;

  @Property({ nullable: true, default: null })
  provinceName: string | null = null;

  @Property({ nullable: true, default: null })
  longitude: string | null = null;

  @Property({ nullable: true, default: null })
  latitude: string | null = null;

  @Property({ type: 'json', nullable: true, default: null })
  suggestedContacts?:
    | {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
        phone?: string;
        bloodType: {
          group: string;
          rh: string;
        };
      }[]
    | null = null;
}

@Entity()
export class EmergencyRequestLog extends AppBaseEntity {
  @ManyToOne({ entity: () => EmergencyRequest })
  emergencyRequest: EmergencyRequest;

  @ManyToOne({ entity: () => Staff, nullable: true })
  staff?: Staff;

  @ManyToOne({ entity: () => Account, nullable: true })
  account?: Account; // For user/hospital actions

  @Enum(() => EmergencyRequestLogStatus)
  status: EmergencyRequestLogStatus;

  @Property({ nullable: true })
  note?: string; // Optional description of the action

  @Property({ nullable: true })
  previousValue?: string; // Store previous status/volume for audit trail

  @Property({ nullable: true })
  newValue?: string; // Store new status/volume for audit trail
}
