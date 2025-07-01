import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BloodTypeInfo,
  BloodCompatibility,
  BloodGroup,
  BloodRh,
  BloodComponentType,
  BloodTypeInfoDetail,
} from '../../database/entities/Blood.entity';
import { IBloodInfoService } from './interfaces/blood-info.service.interface';
import {
  BloodInfoResponseDto,
  BloodCompatibilityResponseDto,
} from './dtos/blood-info-response.dto';

@Injectable()
export class BloodInfoService implements IBloodInfoService {
  private readonly logger = new Logger(BloodInfoService.name);

  constructor(private readonly em: EntityManager) {}

  async getAllBloodTypeInfo(): Promise<BloodInfoResponseDto[]> {
    try {
      const bloodTypeInfos = await this.em.find(BloodTypeInfo, {});
      return bloodTypeInfos.map(this.mapToResponseDto);
    } catch (error: any) {
      this.logger.error(
        `Error getting all blood type info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBloodTypeInfo(
    group: BloodGroup,
    rh: BloodRh,
  ): Promise<BloodInfoResponseDto> {
    try {
      const bloodTypeInfo = await this.em.findOne(BloodTypeInfo, { group, rh });

      if (!bloodTypeInfo) {
        throw new NotFoundException(
          `Blood type ${group}${rh} information not found`,
        );
      }

      return this.mapToResponseDto(bloodTypeInfo);
    } catch (error: any) {
      this.logger.error(
        `Error getting blood type info for ${group}${rh}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBloodCompatibility(
    group: BloodGroup,
    rh: BloodRh,
    componentType?: BloodComponentType,
  ): Promise<BloodCompatibilityResponseDto[]> {
    try {
      const queryOptions: any = {
        $or: [{ donor: { group, rh } }, { recipient: { group, rh } }],
      };

      if (componentType) {
        queryOptions.bloodComponentType = componentType;
      }

      const compatibilities = await this.em.find(
        BloodCompatibility,
        queryOptions,
        {
          populate: ['donor', 'recipient'],
        },
      ); // Group by component type
      const groupedByComponent = compatibilities.reduce(
        (acc, comp) => {
          if (!acc[comp.bloodComponentType]) {
            acc[comp.bloodComponentType] = {
              componentType: comp.bloodComponentType,
              compatibleDonors: new Set<string>(),
              compatibleRecipients: new Set<string>(),
            };
          }

          // If current blood type is recipient, add donor to compatible donors
          if (comp.recipient.group === group && comp.recipient.rh === rh) {
            acc[comp.bloodComponentType].compatibleDonors.add(
              `${comp.donor.group}${comp.donor.rh}`,
            );
          }

          // If current blood type is donor, add recipient to compatible recipients
          if (comp.donor.group === group && comp.donor.rh === rh) {
            acc[comp.bloodComponentType].compatibleRecipients.add(
              `${comp.recipient.group}${comp.recipient.rh}`,
            );
          }

          return acc;
        },
        {} as Record<
          string,
          {
            componentType: BloodComponentType;
            compatibleDonors: Set<string>;
            compatibleRecipients: Set<string>;
          }
        >,
      );

      // Convert to response format
      const results: BloodCompatibilityResponseDto[] = [];

      for (const [compType, data] of Object.entries(groupedByComponent)) {
        const donorInfos = await this.getBloodTypeInfosByKeys(
          Array.from(data.compatibleDonors),
        );
        const recipientInfos = await this.getBloodTypeInfosByKeys(
          Array.from(data.compatibleRecipients),
        );

        results.push({
          componentType: compType as BloodComponentType,
          compatibleDonors: donorInfos,
          compatibleRecipients: recipientInfos,
        });
      }

      return results;
    } catch (error: any) {
      this.logger.error(
        `Error getting blood compatibility for ${group}${rh}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchCompatibleDonors(
    recipientGroup: BloodGroup,
    recipientRh: BloodRh,
    componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]> {
    try {
      const compatibilities = await this.em.find(
        BloodCompatibility,
        {
          recipient: { group: recipientGroup, rh: recipientRh },
          bloodComponentType: componentType,
        },
        {
          populate: ['donor'],
        },
      );

      const donorKeys = compatibilities.map(
        (comp) => `${comp.donor.group}${comp.donor.rh}`,
      );

      return this.getBloodTypeInfosByKeys(donorKeys);
    } catch (error: any) {
      this.logger.error(
        `Error searching compatible donors for ${recipientGroup}${recipientRh} (${componentType}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchCompatibleRecipients(
    donorGroup: BloodGroup,
    donorRh: BloodRh,
    componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]> {
    try {
      const compatibilities = await this.em.find(
        BloodCompatibility,
        {
          donor: { group: donorGroup, rh: donorRh },
          bloodComponentType: componentType,
        },
        {
          populate: ['recipient'],
        },
      );

      const recipientKeys = compatibilities.map(
        (comp) => `${comp.recipient.group}${comp.recipient.rh}`,
      );

      return this.getBloodTypeInfosByKeys(recipientKeys);
    } catch (error: any) {
      this.logger.error(
        `Error searching compatible recipients for ${donorGroup}${donorRh} (${componentType}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getBloodTypeInfosByKeys(
    keys: string[],
  ): Promise<BloodInfoResponseDto[]> {
    const conditions = keys.map((key) => {
      const group = key.slice(0, -1) as BloodGroup;
      const rh = key.slice(-1) as BloodRh;
      return { group, rh };
    });

    if (conditions.length === 0) {
      return [];
    }

    const bloodTypeInfos = await this.em.find(BloodTypeInfo, {
      $or: conditions,
    });

    return bloodTypeInfos.map(this.mapToResponseDto);
  }

  private mapToResponseDto(bloodTypeInfo: BloodTypeInfo): BloodInfoResponseDto {
    return {
      group: bloodTypeInfo.group,
      rh: bloodTypeInfo.rh,
      description: bloodTypeInfo.description,
      characteristics: bloodTypeInfo.characteristics,
      canDonateTo: bloodTypeInfo.canDonateTo,
      canReceiveFrom: bloodTypeInfo.canReceiveFrom,
      frequency: bloodTypeInfo.frequency,
      specialNotes: bloodTypeInfo.specialNotes,
    };
  }

  async getAllBloodTypeDetails(): Promise<Record<string, any>> {
    try {
      const bloodTypeDetails = await this.em.find(BloodTypeInfoDetail, {});

      const result: Record<string, any> = {};

      bloodTypeDetails.forEach((detail) => {
        result[detail.name] = {
          name: detail.groupName,
          description: detail.description,
          redCellsHeight: detail.redCellsHeight,
          plasmaHeight: detail.plasmaHeight,
          antigens: detail.antigens,
          antibodies: detail.antibodies,
          canDonateTo: detail.canDonateTo,
          canReceiveFrom: detail.canReceiveFrom,
        };
      });

      return result;
    } catch (error: any) {
      this.logger.error(
        `Error getting all blood type details: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBloodTypeDetail(group: BloodGroup): Promise<any> {
    try {
      const bloodTypeDetail = await this.em.findOne(BloodTypeInfoDetail, {
        name: group,
      });

      if (!bloodTypeDetail) {
        throw new NotFoundException(`Blood type detail for ${group} not found`);
      }

      return {
        name: bloodTypeDetail.groupName,
        description: bloodTypeDetail.description,
        redCellsHeight: bloodTypeDetail.redCellsHeight,
        plasmaHeight: bloodTypeDetail.plasmaHeight,
        antigens: bloodTypeDetail.antigens,
        antibodies: bloodTypeDetail.antibodies,
        canDonateTo: bloodTypeDetail.canDonateTo,
        canReceiveFrom: bloodTypeDetail.canReceiveFrom,
      };
    } catch (error: any) {
      this.logger.error(
        `Error getting blood type detail for ${group}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
