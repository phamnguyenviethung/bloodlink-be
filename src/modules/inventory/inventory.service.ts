import {
  BloodUnit,
  BloodUnitActions,
  BloodUnitStatus,
  BloodUnitAction,
} from '@/database/entities/inventory.entity';
import { Customer, Staff } from '@/database/entities/Account.entity';
import {
  BloodGroup,
  BloodRh,
  BloodType,
} from '@/database/entities/Blood.entity';
import {
  createPaginatedResponse,
  PaginatedResponseType,
} from '@/share/dtos/pagination.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateBloodUnitDtoType,
  UpdateBloodUnitDtoType,
  CreateBloodUnitActionDtoType,
} from './dtos';
import { IInventoryService } from './interfaces';

@Injectable()
export class InventoryService implements IInventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly em: EntityManager) {}

  // BloodUnit methods
  async createBloodUnit(data: CreateBloodUnitDtoType): Promise<BloodUnit> {
    try {
      // Validate customer exists
      const customer = await this.em.findOne(Customer, { id: data.memberId });
      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${data.memberId} not found`,
        );
      }

      // Validate blood type exists
      const bloodType = await this.em.findOne(BloodType, {
        group: data.bloodGroup as BloodGroup,
        rh: data.bloodRh as BloodRh,
      });
      if (!bloodType) {
        throw new NotFoundException(
          `Blood type ${data.bloodGroup}${data.bloodRh} not found`,
        );
      }

      // Check if customer has donated blood before and validate blood type consistency
      const previousBloodUnits = await this.em.find(
        BloodUnit,
        {
          member: customer,
        },
        {
          populate: ['bloodType'],
        },
      );

      if (previousBloodUnits.length > 0) {
        // Check if the blood type matches previous donations
        const previousBloodType = previousBloodUnits[0].bloodType;
        if (
          previousBloodType.group !== (data.bloodGroup as BloodGroup) ||
          previousBloodType.rh !== (data.bloodRh as BloodRh)
        ) {
          throw new BadRequestException(
            `Blood type mismatch: Customer previously donated ${previousBloodType.group}${previousBloodType.rh} blood, but current donation is ${data.bloodGroup}${data.bloodRh}. A person cannot have multiple blood types.`,
          );
        }

        this.logger.log(
          `Customer ${customer.firstName} ${customer.lastName} has donated ${previousBloodUnits.length} time(s) before with blood type ${previousBloodType.group}${previousBloodType.rh}`,
        );
      } else {
        this.logger.log(
          `First time donation for customer ${customer.firstName} ${customer.lastName} with blood type ${data.bloodGroup}${data.bloodRh}`,
        );
      }

      // Validate blood volume logic
      if (data.remainingVolume > data.bloodVolume) {
        throw new BadRequestException(
          'Remaining volume cannot be greater than total blood volume',
        );
      }

      // Validate expiration date
      const expiredDate =
        data.expiredDate instanceof Date
          ? data.expiredDate
          : new Date(data.expiredDate);
      if (expiredDate <= new Date()) {
        throw new BadRequestException('Expiration date must be in the future');
      }

      const bloodUnit = new BloodUnit();
      bloodUnit.member = customer;
      bloodUnit.bloodType = bloodType;
      bloodUnit.bloodVolume = data.bloodVolume;
      bloodUnit.remainingVolume = data.remainingVolume;
      bloodUnit.expiredDate = expiredDate;
      bloodUnit.status = data.status || BloodUnitStatus.AVAILABLE;

      await this.em.persistAndFlush(bloodUnit);
      return bloodUnit;
    } catch (error: any) {
      this.logger.error(
        `Error creating blood unit: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateBloodUnit(
    id: string,
    data: UpdateBloodUnitDtoType,
  ): Promise<BloodUnit> {
    try {
      const bloodUnit = await this.em.findOne(BloodUnit, { id });
      if (!bloodUnit) {
        throw new NotFoundException(`Blood unit with ID ${id} not found`);
      }

      // Store original values for audit trail
      const originalStatus = bloodUnit.status;
      const originalBloodVolume = bloodUnit.bloodVolume;
      const originalRemainingVolume = bloodUnit.remainingVolume;

      // Validate blood volume logic if both values are provided
      const newBloodVolume = data.bloodVolume || bloodUnit.bloodVolume;
      const newRemainingVolume =
        data.remainingVolume !== undefined
          ? data.remainingVolume
          : bloodUnit.remainingVolume;

      if (newRemainingVolume > newBloodVolume) {
        throw new BadRequestException(
          'Remaining volume cannot be greater than total blood volume',
        );
      }

      // Validate expiration date if provided
      if (data.expiredDate) {
        const expiredDate =
          data.expiredDate instanceof Date
            ? data.expiredDate
            : new Date(data.expiredDate);
        if (expiredDate <= new Date()) {
          throw new BadRequestException(
            'Expiration date must be in the future',
          );
        }
        bloodUnit.expiredDate = expiredDate;
      }

      // Update fields if provided
      if (data.bloodVolume) bloodUnit.bloodVolume = data.bloodVolume;
      if (data.remainingVolume !== undefined)
        bloodUnit.remainingVolume = data.remainingVolume;
      if (data.status) bloodUnit.status = data.status;

      await this.em.flush();

      // Create audit records for changes if staffId is provided
      if (data.staffId) {
        const auditPromises: Promise<any>[] = [];

        // Check if status changed
        if (data.status && data.status !== originalStatus) {
          auditPromises.push(
            this.createBloodUnitAction({
              bloodUnitId: id,
              staffId: data.staffId,
              action: BloodUnitAction.STATUS_UPDATE,
              description: `Status changed from ${originalStatus} to ${data.status}`,
              previousValue: originalStatus,
              newValue: data.status,
            }),
          );
        }

        // Check if blood volume changed
        if (data.bloodVolume && data.bloodVolume !== originalBloodVolume) {
          auditPromises.push(
            this.createBloodUnitAction({
              bloodUnitId: id,
              staffId: data.staffId,
              action: BloodUnitAction.VOLUME_CHANGE,
              description: `Blood volume changed from ${originalBloodVolume}ml to ${data.bloodVolume}ml`,
              previousValue: originalBloodVolume.toString(),
              newValue: data.bloodVolume.toString(),
            }),
          );
        }

        // Check if remaining volume changed
        if (
          data.remainingVolume !== undefined &&
          data.remainingVolume !== originalRemainingVolume
        ) {
          auditPromises.push(
            this.createBloodUnitAction({
              bloodUnitId: id,
              staffId: data.staffId,
              action: BloodUnitAction.VOLUME_CHANGE,
              description: `Remaining volume changed from ${originalRemainingVolume}ml to ${data.remainingVolume}ml`,
              previousValue: originalRemainingVolume.toString(),
              newValue: data.remainingVolume.toString(),
            }),
          );
        }

        // Execute all audit record creations
        if (auditPromises.length > 0) {
          await Promise.all(auditPromises);
        }
      }

      return bloodUnit;
    } catch (error: any) {
      this.logger.error(
        `Error updating blood unit: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBloodUnit(id: string): Promise<BloodUnit> {
    const bloodUnit = await this.em.findOne(
      BloodUnit,
      { id },
      {
        populate: ['member.bloodType', 'bloodType'],
      },
    );
    if (!bloodUnit) {
      throw new NotFoundException(`Blood unit with ID ${id} not found`);
    }

    // Clean up member data to only include required fields
    if (bloodUnit.member) {
      const cleanMember = {
        firstName: bloodUnit.member.firstName,
        lastName: bloodUnit.member.lastName,
        bloodType: bloodUnit.member.bloodType,
      };
      (bloodUnit.member as any) = cleanMember;
    }

    return bloodUnit;
  }

  async deleteBloodUnit(id: string): Promise<void> {
    const bloodUnit = await this.em.findOne(BloodUnit, { id });
    if (!bloodUnit) {
      throw new NotFoundException(`Blood unit with ID ${id} not found`);
    }

    await this.em.removeAndFlush(bloodUnit);
  }

  async getBloodUnits(options: {
    page?: number;
    limit?: number;
    status?: BloodUnitStatus;
    bloodType?: string;
    expired?: boolean;
  }): Promise<PaginatedResponseType<BloodUnit>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryOptions: Record<string, any> = {};

    if (options.status) {
      queryOptions.status = options.status;
    }

    if (options.bloodType) {
      queryOptions.bloodType = { group: options.bloodType };
    }

    if (options.expired !== undefined) {
      if (options.expired) {
        queryOptions.expiredDate = { $lt: new Date() };
      } else {
        queryOptions.expiredDate = { $gte: new Date() };
      }
    }
    const [bloodUnits, total] = await this.em.findAndCount(
      BloodUnit,
      queryOptions,
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
        populate: ['member.bloodType', 'bloodType'],
      },
    );

    // Clean up member data for each blood unit
    bloodUnits.forEach((unit) => {
      if (unit.member) {
        const cleanMember = {
          firstName: unit.member.firstName,
          lastName: unit.member.lastName,
          bloodType: unit.member.bloodType,
        };
        (unit.member as any) = cleanMember;
      }
    });

    return createPaginatedResponse(bloodUnits, page, limit, total);
  }

  // BloodUnitAction methods
  async createBloodUnitAction(
    data: CreateBloodUnitActionDtoType,
  ): Promise<BloodUnitActions> {
    try {
      // Validate blood unit exists
      const bloodUnit = await this.em.findOne(BloodUnit, {
        id: data.bloodUnitId,
      });
      if (!bloodUnit) {
        throw new NotFoundException(
          `Blood unit with ID ${data.bloodUnitId} not found`,
        );
      }

      // Validate staff exists
      const staff = await this.em.findOne(Staff, { id: data.staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${data.staffId} not found`);
      }

      const action = new BloodUnitActions();
      action.bloodUnit = bloodUnit;
      action.staff = staff;
      action.action = data.action;
      action.description = data.description;
      action.previousValue = data.previousValue;
      action.newValue = data.newValue;

      await this.em.persistAndFlush(action);
      return action;
    } catch (error: any) {
      this.logger.error(
        `Error creating blood unit action: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBloodUnitActions(options: {
    page?: number;
    limit?: number;
    action?: BloodUnitAction;
    bloodUnitId?: string;
    staffId?: string;
  }): Promise<PaginatedResponseType<BloodUnitActions>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryOptions: Record<string, any> = {};

    if (options.action) {
      queryOptions.action = options.action;
    }

    if (options.bloodUnitId) {
      queryOptions.bloodUnit = { id: options.bloodUnitId };
    }

    if (options.staffId) {
      queryOptions.staff = { id: options.staffId };
    }

    const [actions, total] = await this.em.findAndCount(
      BloodUnitActions,
      queryOptions,
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
        populate: ['bloodUnit', 'staff'],
      },
    );

    return createPaginatedResponse(actions, page, limit, total);
  }

  async getBloodUnitAction(id: string): Promise<BloodUnitActions> {
    const action = await this.em.findOne(
      BloodUnitActions,
      { id },
      {
        populate: ['bloodUnit', 'staff'],
      },
    );
    if (!action) {
      throw new NotFoundException(`Blood unit action with ID ${id} not found`);
    }
    return action;
  }

  // Blood compatibility search methods
  async searchCompatibleBloodUnitsForWholeBlood(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
    options: {
      page?: number;
      limit?: number;
      status?: BloodUnitStatus;
      expired?: boolean;
    } = {},
  ): Promise<PaginatedResponseType<BloodUnit>> {
    try {
      // Define compatible blood types for whole blood transfusion
      const compatibleBloodTypes = this.getCompatibleBloodTypesForWholeBlood(
        recipientBloodGroup,
        recipientRh,
      );

      const page = options.page || 1;
      const limit = options.limit || 10;

      const queryOptions: Record<string, any> = {
        bloodType: {
          $in: compatibleBloodTypes.map((bt) => ({
            group: bt.group,
            rh: bt.rh,
          })),
        },
      };

      // Add status filter (default to AVAILABLE)
      queryOptions.status = options.status || BloodUnitStatus.AVAILABLE;

      // Add expiration filter (default to non-expired)
      if (options.expired !== undefined) {
        if (options.expired) {
          queryOptions.expiredDate = { $lt: new Date() };
        } else {
          queryOptions.expiredDate = { $gte: new Date() };
        }
      } else {
        // Default: only non-expired blood units
        queryOptions.expiredDate = { $gte: new Date() };
      }

      const [bloodUnits, total] = await this.em.findAndCount(
        BloodUnit,
        queryOptions,
        {
          limit,
          offset: (page - 1) * limit,
          orderBy: { createdAt: 'DESC' },
          populate: ['member.bloodType', 'bloodType'],
        },
      );

      // Clean up member data
      bloodUnits.forEach((unit) => {
        if (unit.member) {
          const cleanMember = {
            firstName: unit.member.firstName,
            lastName: unit.member.lastName,
            bloodType: unit.member.bloodType,
          };
          (unit.member as any) = cleanMember;
        }
      });

      this.logger.log(
        `Found ${total} compatible blood units for whole blood transfusion. Recipient: ${recipientBloodGroup}${recipientRh}`,
      );

      return createPaginatedResponse(bloodUnits, page, limit, total);
    } catch (error: any) {
      this.logger.error(
        `Error searching compatible blood units for whole blood: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchCompatibleBloodUnitsForComponent(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
    componentType: 'RBC' | 'PLASMA' | 'PLATELETS',
    options: {
      page?: number;
      limit?: number;
      status?: BloodUnitStatus;
      expired?: boolean;
    } = {},
  ): Promise<PaginatedResponseType<BloodUnit>> {
    try {
      let compatibleBloodTypes: Array<{ group: BloodGroup; rh: BloodRh }> = [];

      switch (componentType) {
        case 'RBC': // Red Blood Cells - same as whole blood compatibility
          compatibleBloodTypes = this.getCompatibleBloodTypesForWholeBlood(
            recipientBloodGroup,
            recipientRh,
          );
          break;
        case 'PLASMA': // Plasma - reverse compatibility
          compatibleBloodTypes = this.getCompatibleBloodTypesForPlasma(
            recipientBloodGroup,
            recipientRh,
          );
          break;
        case 'PLATELETS': // Platelets - ABO compatibility preferred, Rh less critical
          compatibleBloodTypes = this.getCompatibleBloodTypesForPlatelets(
            recipientBloodGroup,
            recipientRh,
          );
          break;
      }

      const page = options.page || 1;
      const limit = options.limit || 10;

      const queryOptions: Record<string, any> = {
        bloodType: {
          $in: compatibleBloodTypes.map((bt) => ({
            group: bt.group,
            rh: bt.rh,
          })),
        },
      };

      // Add status filter (default to AVAILABLE)
      queryOptions.status = options.status || BloodUnitStatus.AVAILABLE;

      // Add expiration filter (default to non-expired)
      if (options.expired !== undefined) {
        if (options.expired) {
          queryOptions.expiredDate = { $lt: new Date() };
        } else {
          queryOptions.expiredDate = { $gte: new Date() };
        }
      } else {
        // Default: only non-expired blood units
        queryOptions.expiredDate = { $gte: new Date() };
      }

      const [bloodUnits, total] = await this.em.findAndCount(
        BloodUnit,
        queryOptions,
        {
          limit,
          offset: (page - 1) * limit,
          orderBy: { createdAt: 'DESC' },
          populate: ['member.bloodType', 'bloodType'],
        },
      );

      // Clean up member data
      bloodUnits.forEach((unit) => {
        if (unit.member) {
          const cleanMember = {
            firstName: unit.member.firstName,
            lastName: unit.member.lastName,
            bloodType: unit.member.bloodType,
          };
          (unit.member as any) = cleanMember;
        }
      });

      this.logger.log(
        `Found ${total} compatible blood units for ${componentType}. Recipient: ${recipientBloodGroup}${recipientRh}`,
      );

      return createPaginatedResponse(bloodUnits, page, limit, total);
    } catch (error: any) {
      this.logger.error(
        `Error searching compatible blood units for ${componentType}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper methods for blood compatibility rules
  private getCompatibleBloodTypesForWholeBlood(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
  ): Array<{ group: BloodGroup; rh: BloodRh }> {
    const compatibleTypes: Array<{ group: BloodGroup; rh: BloodRh }> = [];

    // ABO compatibility rules for whole blood transfusion
    switch (recipientBloodGroup) {
      case BloodGroup.O:
        // O can only receive O
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          // O+ can also receive O-
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.A:
        // A can receive A and O
        compatibleTypes.push({ group: BloodGroup.A, rh: recipientRh });
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          // A+ can also receive A- and O-
          compatibleTypes.push({ group: BloodGroup.A, rh: BloodRh.NEGATIVE });
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.B:
        // B can receive B and O
        compatibleTypes.push({ group: BloodGroup.B, rh: recipientRh });
        compatibleTypes.push({ group: BloodGroup.O, rh: recipientRh });
        if (recipientRh === BloodRh.POSITIVE) {
          // B+ can also receive B- and O-
          compatibleTypes.push({ group: BloodGroup.B, rh: BloodRh.NEGATIVE });
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        }
        break;
      case BloodGroup.AB:
        // AB can receive all blood types (universal recipient)
        compatibleTypes.push(
          { group: BloodGroup.AB, rh: recipientRh },
          { group: BloodGroup.A, rh: recipientRh },
          { group: BloodGroup.B, rh: recipientRh },
          { group: BloodGroup.O, rh: recipientRh },
        );
        if (recipientRh === BloodRh.POSITIVE) {
          // AB+ can receive all negative types too
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

    // Plasma compatibility is reverse of whole blood (based on antibodies)
    switch (recipientBloodGroup) {
      case BloodGroup.O:
        // O recipient can receive plasma from O, A, B, AB (universal plasma recipient)
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
        // A recipient can receive plasma from A and AB
        compatibleTypes.push(
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.B:
        // B recipient can receive plasma from B and AB
        compatibleTypes.push(
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.AB, rh: BloodRh.POSITIVE },
          { group: BloodGroup.AB, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.AB:
        // AB recipient can only receive AB plasma
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

    // For platelets, ABO compatibility is preferred but not as strict
    // Rh is less critical for platelets
    switch (recipientBloodGroup) {
      case BloodGroup.O:
        // O- is preferred for all, but O can receive from all if needed
        compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.NEGATIVE });
        if (recipientRh === BloodRh.POSITIVE) {
          compatibleTypes.push({ group: BloodGroup.O, rh: BloodRh.POSITIVE });
        }
        // In emergency, can receive from same ABO
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
        // A recipients prefer A platelets, can receive O
        compatibleTypes.push(
          { group: BloodGroup.A, rh: BloodRh.POSITIVE },
          { group: BloodGroup.A, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.B:
        // B recipients prefer B platelets, can receive O
        compatibleTypes.push(
          { group: BloodGroup.B, rh: BloodRh.POSITIVE },
          { group: BloodGroup.B, rh: BloodRh.NEGATIVE },
          { group: BloodGroup.O, rh: BloodRh.POSITIVE },
          { group: BloodGroup.O, rh: BloodRh.NEGATIVE },
        );
        break;
      case BloodGroup.AB:
        // AB can receive platelets from all blood types
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
