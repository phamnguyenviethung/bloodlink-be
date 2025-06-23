import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import {
  BloodCompatibility,
  BloodGroup,
  BloodRh,
  BloodType,
  BloodComponentType,
  BloodTypeInfo,
} from '../entities/Blood.entity';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Check if blood types already exist
    const existingBloodTypes = await em.count(BloodType);
    let bloodTypeEntities: BloodType[] = [];

    if (existingBloodTypes === 0) {
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
      bloodTypeEntities = bloodTypes.map((type) => {
        const bloodType = new BloodType();
        bloodType.group = type.group;
        bloodType.rh = type.rh;
        return bloodType;
      });

      // Persist blood types
      await em.persistAndFlush(bloodTypeEntities);
    } else {
      // Get existing blood types
      bloodTypeEntities = await em.find(BloodType, {});
    }

    // Check if BloodTypeInfo already exists
    const existingBloodTypeInfos = await em.count(BloodTypeInfo);
    if (existingBloodTypeInfos === 0) {
      // Create BloodTypeInfo entities with descriptions
      const bloodTypeInfos = this.createBloodTypeInfos();
      await em.persistAndFlush(bloodTypeInfos);
    }

    // Check if BloodCompatibility already exists
    const existingCompatibility = await em.count(BloodCompatibility);
    if (existingCompatibility === 0) {
      // Create compatibility relationships for all component types
      const compatibilityRules: BloodCompatibility[] = [];

      // For each component type, create compatibility rules
      for (const componentType of Object.values(BloodComponentType)) {
        bloodTypeEntities.forEach((recipient) => {
          const compatibleDonors = this.getCompatibleBloodTypes(
            recipient.group,
            recipient.rh,
            componentType,
          );

          compatibleDonors.forEach((donorType) => {
            const donor = bloodTypeEntities.find(
              (bt) => bt.group === donorType.group && bt.rh === donorType.rh,
            );

            if (donor) {
              const compatibility = new BloodCompatibility();
              compatibility.donor = donor;
              compatibility.recipient = recipient;
              compatibility.bloodComponentType = componentType;
              compatibilityRules.push(compatibility);
            }
          });
        });
      }

      // Persist compatibility rules
      await em.persistAndFlush(compatibilityRules);
    }
  }

  private createBloodTypeInfos(): BloodTypeInfo[] {
    const infos: BloodTypeInfo[] = [];

    // O+
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.O,
        BloodRh.POSITIVE,
        'Nhóm máu O+ là nhóm máu phổ biến nhất, chiếm khoảng 37-38% dân số.',
        'Có kháng nguyên Rh nhưng không có kháng nguyên A hoặc B. Có thể hiến máu cho tất cả các nhóm máu Rh+.',
        'Có thể hiến cho: A+, B+, AB+, O+',
        'Có thể nhận từ: O+, O-',
        '37-38% dân số',
        'Được gọi là "người hiến máu toàn năng" cho các nhóm máu Rh+',
      ),
    );

    // O-
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.O,
        BloodRh.NEGATIVE,
        'Nhóm máu O- là nhóm máu hiếm, chiếm khoảng 6-7% dân số.',
        'Không có kháng nguyên A, B hoặc Rh. Là nhóm máu hiến toàn năng.',
        'Có thể hiến cho: Tất cả các nhóm máu (A+, A-, B+, B-, AB+, AB-, O+, O-)',
        'Có thể nhận từ: Chỉ O-',
        '6-7% dân số',
        'Được gọi là "người hiến máu toàn năng" - rất quý giá trong cấp cứu',
      ),
    );

    // A+
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.A,
        BloodRh.POSITIVE,
        'Nhóm máu A+ là nhóm máu khá phổ biến, chiếm khoảng 34% dân số.',
        'Có kháng nguyên A và Rh, có kháng thể anti-B.',
        'Có thể hiến cho: A+, AB+',
        'Có thể nhận từ: A+, A-, O+, O-',
        '34% dân số',
        'Nhóm máu phổ biến thứ hai sau O+',
      ),
    );

    // A-
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.A,
        BloodRh.NEGATIVE,
        'Nhóm máu A- chiếm khoảng 6% dân số.',
        'Có kháng nguyên A nhưng không có Rh, có kháng thể anti-B.',
        'Có thể hiến cho: A+, A-, AB+, AB-',
        'Có thể nhận từ: A-, O-',
        '6% dân số',
        'Quý giá cho việc hiến máu cho các bệnh nhân A- và AB-',
      ),
    );

    // B+
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.B,
        BloodRh.POSITIVE,
        'Nhóm máu B+ chiếm khoảng 8-9% dân số.',
        'Có kháng nguyên B và Rh, có kháng thể anti-A.',
        'Có thể hiến cho: B+, AB+',
        'Có thể nhận từ: B+, B-, O+, O-',
        '8-9% dân số',
        'Ít phổ biến hơn nhóm A và O',
      ),
    );

    // B-
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.B,
        BloodRh.NEGATIVE,
        'Nhóm máu B- là nhóm máu hiếm, chiếm khoảng 1-2% dân số.',
        'Có kháng nguyên B nhưng không có Rh, có kháng thể anti-A.',
        'Có thể hiến cho: B+, B-, AB+, AB-',
        'Có thể nhận từ: B-, O-',
        '1-2% dân số',
        'Là một trong những nhóm máu hiếm nhất',
      ),
    );

    // AB+
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.AB,
        BloodRh.POSITIVE,
        'Nhóm máu AB+ chiếm khoảng 3-4% dân số.',
        'Có kháng nguyên A, B và Rh. Không có kháng thể anti-A hoặc anti-B.',
        'Có thể hiến cho: Chỉ AB+',
        'Có thể nhận từ: Tất cả các nhóm máu',
        '3-4% dân số',
        'Được gọi là "người nhận máu toàn năng"',
      ),
    );

    // AB-
    infos.push(
      this.createBloodTypeInfo(
        BloodGroup.AB,
        BloodRh.NEGATIVE,
        'Nhóm máu AB- là nhóm máu hiếm nhất, chiếm khoảng 0.6-1% dân số.',
        'Có kháng nguyên A và B nhưng không có Rh. Không có kháng thể anti-A hoặc anti-B.',
        'Có thể hiến cho: AB+, AB-',
        'Có thể nhận từ: A-, B-, AB-, O-',
        '0.6-1% dân số',
        'Nhóm máu hiếm nhất, rất quý giá',
      ),
    );

    return infos;
  }

  private createBloodTypeInfo(
    group: BloodGroup,
    rh: BloodRh,
    description: string,
    characteristics: string,
    canDonateTo: string,
    canReceiveFrom: string,
    frequency: string,
    specialNotes?: string,
  ): BloodTypeInfo {
    const info = new BloodTypeInfo();
    info.group = group;
    info.rh = rh;
    info.description = description;
    info.characteristics = characteristics;
    info.canDonateTo = canDonateTo;
    info.canReceiveFrom = canReceiveFrom;
    info.frequency = frequency;
    info.specialNotes = specialNotes;
    return info;
  }

  // Compatibility logic methods (copied from inventory service)
  private getCompatibleBloodTypes(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
    componentType: BloodComponentType,
  ): Array<{ group: BloodGroup; rh: BloodRh }> {
    switch (componentType) {
      case BloodComponentType.WHOLE_BLOOD:
      case BloodComponentType.RED_CELLS:
        return this.getCompatibleBloodTypesForWholeBlood(
          recipientBloodGroup,
          recipientRh,
        );
      case BloodComponentType.PLASMA:
        return this.getCompatibleBloodTypesForPlasma(
          recipientBloodGroup,
          recipientRh,
        );
      case BloodComponentType.PLATELETS:
        return this.getCompatibleBloodTypesForPlatelets(
          recipientBloodGroup,
          recipientRh,
        );
      default:
        return [];
    }
  }

  private getCompatibleBloodTypesForWholeBlood(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
  ): Array<{ group: BloodGroup; rh: BloodRh }> {
    const compatibleTypes: Array<{ group: BloodGroup; rh: BloodRh }> = [];

    switch (recipientBloodGroup) {
      case BloodGroup.O:
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.A:
        compatibleTypes.push({ group: BloodGroup.A, rh: recipientRh });
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push({ group: BloodGroup.A, rh: BloodRh.NEGATIVE });
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.B:
        compatibleTypes.push({ group: BloodGroup.B, rh: recipientRh });
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push({ group: BloodGroup.B, rh: BloodRh.NEGATIVE });
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.AB:
        compatibleTypes.push(
          { group: BloodGroup.AB, rh: recipientRh },
          { group: BloodGroup.A, rh: recipientRh },
          { group: BloodGroup.B, rh: recipientRh },
          { group: BloodGroup.O, rh: recipientRh },
        );
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push(
            { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
            { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
            { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
            { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
          );
        }
        break;
    }

    return compatibleTypes;
  }

  private getCompatibleBloodTypesForPlasma(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
  ): Array<{ group: BloodGroup; rh: BloodRh }> {
    const compatibleTypes: Array<{ group: BloodGroup; rh: BloodRh }> = [];

    switch (recipientBloodGroup) {
      case BloodGroup.O:
        compatibleTypes.push(
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.A:
        compatibleTypes.push(
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.B:
        compatibleTypes.push(
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.AB:
        compatibleTypes.push(
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
    }

    return compatibleTypes;
  }

  private getCompatibleBloodTypesForPlatelets(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
  ): Array<{ group: BloodGroup; rh: BloodRh }> {
    const compatibleTypes: Array<{ group: BloodGroup; rh: BloodRh }> = [];

    switch (recipientBloodGroup) {
      case BloodGroup.O:
        compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.POSITIVE });
        }
        compatibleTypes.push(
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.A:
        compatibleTypes.push(
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.B:
        compatibleTypes.push(
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.AB:
        compatibleTypes.push(
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
        );
        break;
    }

    return compatibleTypes;
  }
}
