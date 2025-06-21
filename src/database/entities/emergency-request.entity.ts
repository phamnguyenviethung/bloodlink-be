import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { AppBaseEntity } from './base.entity';
import { Account, Staff } from './Account.entity';
import { BloodUnit } from './inventory.entity';
import { BloodType } from './Blood.entity';

export enum EmergencyRequestStatus {
  PENDING = 'pending',
  WAIT_FOR_DONOR = 'wait_for_donor',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// 'RBC' | 'PLASMA' | 'PLATELETS'
export enum BloodTypeComponent {
  RBC = 'rbc',
  PLASMA = 'plasma',
  PLATELETS = 'platelets',
}

export enum EmergencyRequestLogStatus {
  STATUS_UPDATE = 'status_update',
  BLOOD_UNIT_ASSIGNED = 'blood_unit_assigned',
  VOLUME_CHANGE = 'volume_change',
  LOCATION_CHANGE = 'location_change',
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

  @Property()
  address: string;

  @Property({ nullable: true, default: null })
  longitude: string | null = null;

  @Property({ nullable: true, default: null })
  latitude: string | null = null;
}

@Entity()
export class EmergencyRequestLog extends AppBaseEntity {
  @ManyToOne({ entity: () => EmergencyRequest })
  emergencyRequest: EmergencyRequest;

  @ManyToOne({ entity: () => Staff })
  staff: Staff;

  @Enum(() => EmergencyRequestLogStatus)
  status: EmergencyRequestLogStatus;

  @Property({ nullable: true })
  note?: string; // Optional description of the action

  @Property({ nullable: true })
  previousValue?: string; // Store previous status/volume for audit trail

  @Property({ nullable: true })
  newValue?: string; // Store new status/volume for audit trail
}
