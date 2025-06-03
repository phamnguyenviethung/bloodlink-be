import { Entity, Enum, Property } from '@mikro-orm/core';
import { AppBaseEntity } from './Base.entity';

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
}
