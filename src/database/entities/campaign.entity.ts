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
  /**
   * Initial status when a donation request is created
   */
  PENDING = 'pending',

  /**
   * Donation request was rejected or cancelled
   */
  REJECTED = 'rejected',

  /**
   * Blood collection has been completed, but official results have not been returned yet
   */
  COMPLETED = 'completed',

  /**
   * Official results have been returned, donation process is fully completed
   */
  RESULT_RETURNED = 'result_returned',

  /**
   * Appointment for blood donation has been confirmed
   */
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',

  /**
   * Appointment for blood donation was cancelled
   */
  APPOINTMENT_CANCELLED = 'appointment_cancelled',

  /**
   * Donor did not show up for the appointment
   */
  APPOINTMENT_ABSENT = 'appointment_absent',

  /**
   * Customer cancelled the donation request
   */
  CUSTOMER_CANCELLED = 'customer_cancelled',

  /**
   * Customer checked in for the donation
   */
  CUSTOMER_CHECKED_IN = 'customer_checked_in',
}

@Entity()
export class CampaignDonation extends AppBaseEntity {
  @ManyToOne({ entity: () => Campaign })
  campaign: Campaign;

  @ManyToOne({ entity: () => Customer })
  donor: Customer;

  @Enum(() => CampaignDonationStatus)
  currentStatus: CampaignDonationStatus = CampaignDonationStatus.PENDING;

  @Property({ nullable: true })
  appointmentDate?: Date;
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
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity()
export class DonationResult extends AppBaseEntity {
  @ManyToOne({ entity: () => CampaignDonation })
  campaignDonation: CampaignDonation;

  @Property()
  volumeMl: number;

  @Property()
  bloodType: string;

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
  status: DonationResultStatus = DonationResultStatus.REJECTED;

  @ManyToOne({ entity: () => Staff, nullable: true })
  processedBy?: Staff = null;
}
export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity()
export class DonationReminder extends AppBaseEntity {
  @ManyToOne({ entity: () => Customer })
  donor: Customer;

  @Property()
  scheduledDate: Date;

  @Property({ nullable: true })
  sentDate?: Date;

  @Property({ nullable: true })
  message?: string;

  @Property({ nullable: true, type: 'json' })
  metadata?: Record<string, any> = {};

  @ManyToOne({ entity: () => CampaignDonation, nullable: true })
  campaignDonation?: CampaignDonation;
}
