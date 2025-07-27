import {
  Entity,
  Enum,
  ManyToOne,
  OneToOne,
  Property,
  Unique,
} from '@mikro-orm/core';

import { AppBaseEntity } from './base.entity';
import { BloodType } from './Blood.entity';

export enum AccountRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff',
  HOSPITAL = 'hospital',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class Account extends AppBaseEntity {
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

  @ManyToOne(() => BloodType, { nullable: true })
  bloodType?: BloodType;

  @Property({ nullable: true })
  firstName: string;

  @Property({ nullable: true })
  lastName: string;

  @Enum({ items: () => Gender, nullable: true, default: null })
  gender: Gender | null = null;

  @Property({ nullable: true, default: null })
  dateOfBirth: string | null = null;

  @Property({ nullable: true, default: null })
  phone: string | null = null;

  @Property({ nullable: true, default: null })
  citizenId: string | null = null;

  @Property({ nullable: true, default: null })
  longitude: string | null = null;

  @Property({ nullable: true, default: null })
  latitude: string | null = null;

  @Property({ nullable: true, default: null })
  address: string | null = null;

  @Property({ nullable: true, default: null })
  wardCode: string | null = null;

  @Property({ nullable: true, default: null })
  districtCode: string | null = null;

  @Property({ nullable: true, default: null })
  provinceCode: string | null = null;

  @Property({ nullable: true, default: null })
  wardName: string | null = null;

  @Property({ nullable: true, default: null })
  districtName: string | null = null;

  @Property({ nullable: true, default: null })
  provinceName: string | null = null;

  @Property({ nullable: true, default: null })
  lastDonationDate: Date | null = null;

  @Property({ nullable: true, default: 'active' })
  status: string | null = 'active';

  @Property({ nullable: true, default: null })
  avatar: string | null = null;

  @Property({ default: true })
  canChangeBloodType: boolean = true;
}
export enum StaffRole {
  DOCTOR = 'doctor',
  STAFF = 'staff',
}
@Entity()
export class Staff extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property({ nullable: true })
  firstName: string;

  @Property({ nullable: true })
  lastName: string;

  @Enum(() => StaffRole)
  role: StaffRole = StaffRole.DOCTOR;

  @Property({ nullable: true, default: null })
  avatar: string | null = null;
}

@Entity()
export class Admin extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property({ nullable: true })
  firstName: string;

  @Property({ nullable: true })
  lastName: string;

  @Property({ nullable: true, default: null })
  avatar: string | null = null;
}

@Entity()
export class Hospital extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property()
  name: string;

  @Property({ nullable: true, default: null })
  phone: string | null = null;

  @Property({ nullable: true, default: null })
  longitude: string | null = null;

  @Property({ nullable: true, default: null })
  latitude: string | null = null;

  @Property({ nullable: true, default: null })
  wardCode: string | null = null;

  @Property({ nullable: true, default: null })
  districtCode: string | null = null;

  @Property({ nullable: true, default: null })
  provinceCode: string | null = null;

  @Property({ nullable: true, default: null })
  wardName: string | null = null;

  @Property({ nullable: true, default: null })
  districtName: string | null = null;

  @Property({ nullable: true, default: null })
  provinceName: string | null = null;

  @Property({ nullable: true, default: 'active' })
  status: string | null = 'active';

  @Property({ nullable: true, default: null })
  avatar: string | null = null;
}
