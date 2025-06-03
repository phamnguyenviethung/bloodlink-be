import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {
  BloodCompatibility,
  BloodRh,
  BloodType,
  BloodGroup,
} from '../entities/blood.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create all blood types
    const bloodTypes = [
      { group: BloodGroup.A, rh: BloodRh.POSITIVE },
      { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
      { group: BloodGroup.B, rh: BloodRh.POSITIVE },
      { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
      { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
      { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
      { group: BloodGroup.O, rh: BloodRh.POSITIVE },
      { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
    ];

    // Create BloodType entities
    const bloodTypeEntities = bloodTypes.map((type) => {
      const bloodType = new BloodType();
      bloodType.group = type.group;
      bloodType.rh = type.rh;
      return bloodType;
    });

    // Persist blood types
    await em.persistAndFlush(bloodTypeEntities);

    // Create compatibility relationships
    const compatibilityRules: { donor: BloodType; recipient: BloodType }[] = [];

    // For each blood type
    bloodTypeEntities.forEach((recipient) => {
      bloodTypeEntities.forEach((donor) => {
        // Group compatibility rules
        const isGroupCompatible =
          donor.group === recipient.group || // Same group
          donor.group === BloodGroup.O || // O is universal donor
          (recipient.group === BloodGroup.AB && // AB is universal recipient
            (donor.group === BloodGroup.A || donor.group === BloodGroup.B));

        // Rh compatibility rules
        const isRhCompatible =
          recipient.rh === BloodRh.POSITIVE || // Rh+ can receive from both
          (recipient.rh === BloodRh.NEGATIVE && donor.rh === BloodRh.NEGATIVE); // Rh- only from Rh-

        // If both group and Rh are compatible, create relationship
        if (isGroupCompatible && isRhCompatible) {
          const compatibility = new BloodCompatibility();
          compatibility.donor = donor;
          compatibility.recipient = recipient;
          compatibilityRules.push(compatibility);
        }
      });
    });

    // Persist compatibility rules
    await em.persistAndFlush(compatibilityRules);
  }
}
