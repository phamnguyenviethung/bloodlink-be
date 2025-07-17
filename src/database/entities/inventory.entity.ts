import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";

import { Customer, Staff } from "./Account.entity";
import { AppBaseEntity } from "./base.entity";
import { BloodComponentType, BloodType } from "./Blood.entity";

export enum BloodUnitStatus {
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired',
  TRANSFERRED = 'transferred',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
}

export enum BloodUnitAction {
  STATUS_UPDATE = 'status_update',
  VOLUME_CHANGE = 'volume_change',
}

@Entity()
export class BloodUnit extends AppBaseEntity {
  @ManyToOne(() => Customer)
  member: Customer;

  @ManyToOne(() => BloodType)
  bloodType: BloodType;

  @Property()
  bloodVolume: number; // in ml

  @Enum(() => BloodComponentType)
  bloodComponentType: BloodComponentType;

  @Property()
  remainingVolume: number; // in ml

  @Property()
  isSeparated: boolean = false; // Indicates if the blood unit has been separated into components

  @ManyToOne(() => BloodUnit, { nullable: true })
  parentWholeBlood?: BloodUnit; // If this unit is a component, link to the whole blood unit

  @Property()
  expiredDate: Date;

  @Enum(() => BloodUnitStatus)
  status: BloodUnitStatus = BloodUnitStatus.AVAILABLE;
}

@Entity()
export class BloodUnitActions extends AppBaseEntity {
  @ManyToOne(() => BloodUnit)
  bloodUnit: BloodUnit;

  @ManyToOne(() => Staff)
  staff: Staff;

  @Enum(() => BloodUnitAction)
  action: BloodUnitAction;

  @Property({ nullable: true })
  description?: string; // Optional description of the action

  @Property({ nullable: true })
  previousValue?: string; // Store previous status/volume for audit trail

  @Property({ nullable: true })
  newValue?: string; // Store new status/volume for audit trail
}
