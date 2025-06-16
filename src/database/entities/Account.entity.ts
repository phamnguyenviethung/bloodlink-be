import {
  Entity,
  Enum,
  OneToOne,
  Property,
  Unique,
  OneToMany,
  Collection,
  ManyToOne,
} from '@mikro-orm/core';
import { AppBaseEntity } from './base.entity';
import { BloodType } from './Blood.entity';

export enum AccountRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff',
  HOSPITAL = 'hospital',
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

  @ManyToOne(() => BloodType, { nullable: true })
  bloodType: BloodType | null = null;
}
export enum StaffRole {
  DOCTOR = 'doctor',
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
}

@Entity()
export class Admin extends AppBaseEntity {
  @OneToOne(() => Account)
  account: Account;

  @Property({ nullable: true })
  firstName: string;

  @Property({ nullable: true })
  lastName: string;
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
}
