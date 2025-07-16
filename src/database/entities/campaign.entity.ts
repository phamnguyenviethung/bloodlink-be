import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
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

@Entity()
export class DonationResult extends AppBaseEntity {
  @ManyToOne({ entity: () => CampaignDonation })
  campaignDonation: CampaignDonation;

  @Property({ nullable: true, type: 'json' })
  bloodTestResults?: Record<string, any> = {};

  @Property({ nullable: true, type: 'json' })
  template?: Record<string, any> = {};

  @Property({ nullable: true })
  resultDate?: Date;

  @Property({ nullable: true })
  notes?: string = '';

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

  @Enum(() => ReminderStatus)
  status: ReminderStatus = ReminderStatus.PENDING;

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

@Entity()
export class DonationResultTemplate extends AppBaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string = '';

  @Property()
  active: boolean = true;

  @ManyToOne({ entity: () => Staff })
  createdBy: Staff;

  @ManyToOne({ entity: () => Staff })
  updatedBy: Staff;

  @OneToMany({ entity: () => DonationResultTemplateItem, mappedBy: 'template' })
  items: DonationResultTemplateItem[] = [];
}

export enum DonationResultTemplateItemType {
  NUMBER = 'number',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  LINK = 'link',
  TEXT = 'text',
}

@Entity()
export class DonationResultTemplateItem extends AppBaseEntity {
  @ManyToOne({ entity: () => DonationResultTemplate })
  template: DonationResultTemplate;

  @Enum(() => DonationResultTemplateItemType)
  type: DonationResultTemplateItemType;

  @Property()
  label: string;

  @Property({ nullable: true })
  description?: string = '';

  @Property({ nullable: true })
  placeholder?: string = '';

  @Property({ nullable: true })
  defaultValue?: string = '';

  @Property()
  sortOrder: number;

  @Property({ nullable: true })
  minValue?: number;

  @Property({ nullable: true })
  maxValue?: number;

  @Property({ nullable: true })
  minLength?: number;

  @Property({ nullable: true })
  maxLength?: number;

  @Property()
  isRequired: boolean = true;

  @Property({ nullable: true })
  pattern?: string = '';

  @OneToMany({
    entity: () => DonationResultTemplateItemOption,
    mappedBy: 'item',
  })
  options: DonationResultTemplateItemOption[] = [];
}

@Entity()
export class DonationResultTemplateItemOption extends AppBaseEntity {
  @ManyToOne({ entity: () => DonationResultTemplateItem })
  item: DonationResultTemplateItem;

  @Property()
  label: string;
}
