import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { Customer, Staff } from './Account.entity';
import { AppBaseEntity } from './base.entity';
import { BloodGroup, BloodRh } from './Blood.entity';

export enum CampaignStatus {
  ACTIVE = 'active',
  NOT_STARTED = 'not_started',
  ENDED = 'ended',
}

@Entity()
export class Campaign extends AppBaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string = '';

  @Property()
  startDate: Date;

  @Property()
  endDate: Date;

  @Enum(() => CampaignStatus)
  status?: CampaignStatus = CampaignStatus.NOT_STARTED;

  @Property({ nullable: true })
  banner?: string = '';

  @Property({ nullable: true })
  location?: string = '';

  @Property({ nullable: true, default: 0 })
  limitDonation?: number = 0;

  @Property({ nullable: true })
  bloodCollectionDate?: Date;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any> = {};
}

export enum CampaignDonationStatus {
  COMPLETED = 'completed',
  RESULT_RETURNED = 'result_returned',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_ABSENT = 'appointment_absent',
  CUSTOMER_CANCELLED = 'customer_cancelled',
  CUSTOMER_CHECKED_IN = 'customer_checked_in',
  NOT_QUALIFIED = 'not_qualified',
  NO_SHOW_AFTER_CHECKIN = 'no_show_after_checkin',
}

@Entity()
export class CampaignDonation extends AppBaseEntity {
  @ManyToOne({ entity: () => Campaign })
  campaign: Campaign;

  @ManyToOne({ entity: () => Customer })
  donor: Customer;

  @Enum(() => CampaignDonationStatus)
  currentStatus: CampaignDonationStatus =
    CampaignDonationStatus.APPOINTMENT_CONFIRMED;

  @Property()
  volumeMl: number;

  @Property({ nullable: true })
  appointmentDate?: Date;

  @Property({ nullable: true, default: false })
  isBloodUnitCreated: boolean;
}

@Entity()
export class CampaignDonationLog extends AppBaseEntity {
  @ManyToOne({ entity: () => CampaignDonation })
  campaignDonation: CampaignDonation;

  @Enum(() => CampaignDonationStatus)
  status: CampaignDonationStatus;

  @Property({ nullable: true })
  note?: string = '';

  @ManyToOne({ entity: () => Staff, nullable: true })
  staff?: Staff = null;
}

export enum DonationResultStatus {
  COMPLETED = 'completed',
  RESULT_NOT_QUALIFIED = 'result_not_qualified',
}

@Entity()
export class DonationResult extends AppBaseEntity {
  @ManyToOne({ entity: () => CampaignDonation })
  campaignDonation: CampaignDonation;

  @Property()
  volumeMl: number;

  @Property()
  @Enum(() => BloodGroup)
  bloodGroup: BloodGroup;

  @Property()
  @Enum(() => BloodRh)
  bloodRh: BloodRh;

  @Property({ nullable: true })
  notes?: string = '';

  @Property({ nullable: true })
  rejectReason?: string = '';

  @Enum(() => DonationResultStatus)
  status: DonationResultStatus = DonationResultStatus.RESULT_NOT_QUALIFIED;

  @ManyToOne({ entity: () => Staff, nullable: true })
  processedBy?: Staff = null;
}

export enum ReminderType {
  BEFORE_DONATION = 'before_donation',
  AFTER_DONATION = 'after_donation',
}

@Entity()
export class DonationReminder extends AppBaseEntity {
  @ManyToOne({ entity: () => Customer })
  donor: Customer;

  @Property()
  message: string;

  @Property({ nullable: true })
  type?: ReminderType = null;

  @Property({ type: 'json' })
  metadata?: Record<string, any> = {};

  @ManyToOne({ entity: () => CampaignDonation, nullable: true })
  campaignDonation?: CampaignDonation;
}
