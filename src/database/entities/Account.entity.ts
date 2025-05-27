import { Entity, Enum, OneToOne, Property, Unique } from '@mikro-orm/core';
import { AppBaseEntity } from './base.entity';

export enum AccountRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff',
  HOSPITAL = 'hospital',
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

@Entity()
export class Admin extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;
}

@Entity()
export class Hospital extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property()
  name: string;

  @Property({ nullable: true })
  phone?: string;

  @Property()
  longitude: number;

  @Property()
  latitude: number;

  @Property()
  ward_code: string;

  @Property()
  district_code: string;

  @Property()
  province_code: string;

  @Property()
  ward_name: string;

  @Property()
  district_name: string;

  @Property()
  province_name: string;

  @Property({ nullable: true, default: 'active' })
  status?: string;
}
