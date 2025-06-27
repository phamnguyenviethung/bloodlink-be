import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { Customer, Staff } from './Account.entity';
import { AppBaseEntity } from './base.entity';

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

@Entity()
export class DonationResult extends AppBaseEntity {
  @ManyToOne({ entity: () => CampaignDonation })
  campaignDonation: CampaignDonation;

  @Property({ nullable: true, type: 'json' })
  bloodTestResults?: Record<string, any> = {};

  @Property({ nullable: true })
  resultDate?: Date;

  @Property({ nullable: true })
  notes?: string = '';

  @ManyToOne({ entity: () => Staff, nullable: true })
  processedBy?: Staff = null;
}
