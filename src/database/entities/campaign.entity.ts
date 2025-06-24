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
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
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
