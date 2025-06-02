import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';

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
}
