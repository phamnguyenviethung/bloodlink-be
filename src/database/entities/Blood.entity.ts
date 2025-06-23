import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

export enum BloodGroup {
  A = 'A',
  B = 'B',
  AB = 'AB',
  O = 'O',
}

export enum BloodRh {
  POSITIVE = '+',
  NEGATIVE = '-',
}

export enum BloodComponentType {
  PLASMA = 'plasma',
  PLATELETS = 'platelets',
  RED_CELLS = 'red_cells',
  WHOLE_BLOOD = 'whole_blood',
}

@Entity()
export class BloodType {
  @PrimaryKey()
  group: BloodGroup;

  @PrimaryKey()
  rh: BloodRh;
}

@Entity()
export class BloodCompatibility {
  @ManyToOne({ entity: () => BloodType, primary: true })
  donor: BloodType;

  @ManyToOne({ entity: () => BloodType, primary: true })
  recipient: BloodType;

  @PrimaryKey()
  @Enum(() => BloodComponentType)
  bloodComponentType: BloodComponentType;
}

@Entity()
export class BloodTypeInfo {
  @PrimaryKey()
  @Enum(() => BloodGroup)
  group: BloodGroup;

  @PrimaryKey()
  @Enum(() => BloodRh)
  rh: BloodRh;

  @Property({ type: 'text' })
  description: string;

  @Property({ type: 'text' })
  characteristics: string;

  @Property({ type: 'text' })
  canDonateTo: string; // Mô tả ai có thể nhận máu từ nhóm máu này

  @Property({ type: 'text' })
  canReceiveFrom: string; // Mô tả nhóm máu này có thể nhận máu từ ai

  @Property({ type: 'text' })
  frequency: string; // Tần suất xuất hiện trong dân số

  @Property({ type: 'text', nullable: true })
  specialNotes?: string; // Ghi chú đặc biệt
}
