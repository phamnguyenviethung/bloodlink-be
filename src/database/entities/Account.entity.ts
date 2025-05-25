import { Entity, Enum, OneToOne, Property, Unique } from '@mikro-orm/core';
import { AppBaseEntity } from './base.entity';

export enum AccountRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff',
}

@Entity()
export class Account extends AppBaseEntity {
  @Property({ nullable: true })
  firstName: string;

  @Property({ nullable: true })
  lastName: string;

  @Property()
  @Unique()
  email: string;

  @Enum(() => AccountRole)
  role: AccountRole;
}

@Entity()
export class Customer extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property({ default: 0 })
  balance: number = 0;
}

@Entity()
export class Staff extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Enum(() => StaffRole)
  role: StaffRole;
}

export enum StaffRole {
  MENTOR = 'mentor',
}
