import {
  Account,
  AccountRole,
  Staff,
} from '@/database/entities/Account.entity';
import {
  BloodGroup,
  BloodRh,
  BloodType,
} from '@/database/entities/Blood.entity';
import {
  BloodTypeComponent,
  EmergencyRequest,
  EmergencyRequestLog,
  EmergencyRequestLogStatus,
  EmergencyRequestStatus,
} from '@/database/entities/emergency-request.entity';
import {
  BloodUnit,
  BloodUnitStatus,
} from '@/database/entities/inventory.entity';
import {
  createPaginatedResponse,
  PaginatedResponseType,
} from '@/share/dtos/pagination.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  ApproveEmergencyRequestDtoType,
  CreateEmergencyRequestDtoType,
  EmergencyRequestListQueryDtoType,
  EmergencyRequestLogListQueryDtoType,
  UpdateEmergencyRequestDtoType,
  UserUpdateEmergencyRequestDtoType,
} from './dtos';
import { IEmergencyRequestService } from './interfaces';

@Injectable()
export class EmergencyRequestService implements IEmergencyRequestService {
  private readonly logger = new Logger(EmergencyRequestService.name);

  constructor(private readonly em: EntityManager) {}

  async createEmergencyRequest(
    data: CreateEmergencyRequestDtoType,
    requestedById: string,
  ): Promise<EmergencyRequest> {
    try {
      // Validate requester exists and has appropriate role
      const requester = await this.em.findOne(Account, { id: requestedById });
      if (!requester) {
        throw new NotFoundException(
          `Account with ID ${requestedById} not found`,
        );
      }

      if (![AccountRole.USER, AccountRole.HOSPITAL].includes(requester.role)) {
        throw new ForbiddenException(
          'Only USER and HOSPITAL accounts can create emergency requests',
        );
      }

      // Validate blood type exists
      const bloodType = await this.em.findOne(BloodType, {
        group: data.bloodGroup,
        rh: data.bloodRh,
      });
      if (!bloodType) {
        throw new NotFoundException(
          `Blood type ${data.bloodGroup}${data.bloodRh} not found`,
        );
      }
      const emergencyRequest = new EmergencyRequest();
      emergencyRequest.requestedBy = requester;
      emergencyRequest.usedVolume = 0; // Initially 0
      emergencyRequest.requiredVolume = data.requiredVolume;
      emergencyRequest.bloodType = bloodType;
      emergencyRequest.bloodTypeComponent = data.bloodTypeComponent || null;
      emergencyRequest.description = data.description || null;
      emergencyRequest.status = EmergencyRequestStatus.PENDING;

      // Set start date to current date
      emergencyRequest.startDate = new Date();

      // Set end date to 1 day from start date (business rule)
      const endDate = new Date(emergencyRequest.startDate);
      endDate.setDate(endDate.getDate() + 1);
      emergencyRequest.endDate = endDate;

      // Set location fields
      emergencyRequest.wardCode = data.wardCode || null;
      emergencyRequest.districtCode = data.districtCode || null;
      emergencyRequest.provinceCode = data.provinceCode || null;
      emergencyRequest.wardName = data.wardName || null;
      emergencyRequest.districtName = data.districtName || null;
      emergencyRequest.provinceName = data.provinceName || null;
      emergencyRequest.longitude = data.longitude || null;
      emergencyRequest.latitude = data.latitude || null;
      // bloodUnit will be assigned later by STAFF during update

      await this.em.persistAndFlush(emergencyRequest);
      this.logger.log(
        `Emergency request created by ${requester.email} for ${data.requiredVolume}ml of ${data.bloodGroup}${data.bloodRh} ${data.bloodTypeComponent || 'whole blood'} - Valid from ${emergencyRequest.startDate.toISOString()} to ${emergencyRequest.endDate.toISOString()} - Blood unit will be assigned by staff`,
      );

      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error creating emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateEmergencyRequest(
    id: string,
    data: UpdateEmergencyRequestDtoType,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodUnit', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      } // Store original values for audit trail
      const originalStatus = emergencyRequest.status;
      const originalUsedVolume = emergencyRequest.usedVolume;
      const originalRequiredVolume = emergencyRequest.requiredVolume;
      const originalBloodUnitId = emergencyRequest.bloodUnit?.id || null;
      const originalWardCode = emergencyRequest.wardCode;
      const originalDistrictCode = emergencyRequest.districtCode;
      const originalProvinceCode = emergencyRequest.provinceCode;
      const originalWardName = emergencyRequest.wardName;
      const originalDistrictName = emergencyRequest.districtName;
      const originalProvinceName = emergencyRequest.provinceName;
      const originalLongitude = emergencyRequest.longitude;
      const originalLatitude = emergencyRequest.latitude;

      // Validate blood unit if changed
      if (data.bloodUnitId && data.bloodUnitId !== originalBloodUnitId) {
        const newBloodUnit = await this.em.findOne(BloodUnit, {
          id: data.bloodUnitId,
        });
        if (!newBloodUnit) {
          throw new NotFoundException(
            `Blood unit with ID ${data.bloodUnitId} not found`,
          );
        }
        emergencyRequest.bloodUnit = newBloodUnit;
      }

      // Validate blood type if changed
      if (data.bloodGroup || data.bloodRh) {
        const bloodGroup = data.bloodGroup || emergencyRequest.bloodType.group;
        const bloodRh = data.bloodRh || emergencyRequest.bloodType.rh;

        const bloodType = await this.em.findOne(BloodType, {
          group: bloodGroup,
          rh: bloodRh,
        });
        if (!bloodType) {
          throw new NotFoundException(
            `Blood type ${bloodGroup}${bloodRh} not found`,
          );
        }
        emergencyRequest.bloodType = bloodType;
      } // Validate volume logic
      const newUsedVolume = data.usedVolume ?? emergencyRequest.usedVolume;
      const newRequiredVolume =
        data.requiredVolume ?? emergencyRequest.requiredVolume;

      if (newUsedVolume > newRequiredVolume) {
        throw new BadRequestException(
          'Used volume cannot be greater than required volume',
        );
      }

      // Only validate against blood unit volume if blood unit is assigned
      if (
        emergencyRequest.bloodUnit &&
        newRequiredVolume > emergencyRequest.bloodUnit.remainingVolume
      ) {
        throw new BadRequestException(
          `Required volume (${newRequiredVolume}ml) exceeds available volume (${emergencyRequest.bloodUnit.remainingVolume}ml)`,
        );
      }

      // Update fields if provided
      if (data.usedVolume !== undefined)
        emergencyRequest.usedVolume = data.usedVolume;
      if (data.requiredVolume !== undefined)
        emergencyRequest.requiredVolume = data.requiredVolume;
      if (data.bloodTypeComponent !== undefined)
        emergencyRequest.bloodTypeComponent = data.bloodTypeComponent;
      if (data.description !== undefined)
        emergencyRequest.description = data.description;
      if (data.rejectionReason !== undefined)
        emergencyRequest.rejectionReason = data.rejectionReason;
      if (data.status) emergencyRequest.status = data.status;
      if (data.wardCode !== undefined)
        emergencyRequest.wardCode = data.wardCode;
      if (data.districtCode !== undefined)
        emergencyRequest.districtCode = data.districtCode;
      if (data.provinceCode !== undefined)
        emergencyRequest.provinceCode = data.provinceCode;
      if (data.wardName !== undefined)
        emergencyRequest.wardName = data.wardName;
      if (data.districtName !== undefined)
        emergencyRequest.districtName = data.districtName;
      if (data.provinceName !== undefined)
        emergencyRequest.provinceName = data.provinceName;
      if (data.longitude !== undefined)
        emergencyRequest.longitude = data.longitude;
      if (data.latitude !== undefined)
        emergencyRequest.latitude = data.latitude;

      await this.em.flush();

      // Create audit records for changes if staffId is provided
      if (data.staffId) {
        const auditPromises: Promise<any>[] = [];

        // Status change
        if (data.status && data.status !== originalStatus) {
          auditPromises.push(
            this.createEmergencyRequestLog({
              emergencyRequestId: id,
              staffId: data.staffId,
              status: EmergencyRequestLogStatus.STATUS_UPDATE,
              note: `Status changed from ${originalStatus} to ${data.status}`,
              previousValue: originalStatus,
              newValue: data.status,
            }),
          );
        }

        // Blood unit assignment change
        if (data.bloodUnitId && data.bloodUnitId !== originalBloodUnitId) {
          auditPromises.push(
            this.createEmergencyRequestLog({
              emergencyRequestId: id,
              staffId: data.staffId,
              status: EmergencyRequestLogStatus.BLOOD_UNIT_ASSIGNED,
              note: `Blood unit changed from ${originalBloodUnitId} to ${data.bloodUnitId}`,
              previousValue: originalBloodUnitId,
              newValue: data.bloodUnitId,
            }),
          );
        }

        // Volume change
        if (
          (data.usedVolume !== undefined &&
            data.usedVolume !== originalUsedVolume) ||
          (data.requiredVolume !== undefined &&
            data.requiredVolume !== originalRequiredVolume)
        ) {
          auditPromises.push(
            this.createEmergencyRequestLog({
              emergencyRequestId: id,
              staffId: data.staffId,
              status: EmergencyRequestLogStatus.VOLUME_CHANGE,
              note: `Volume changed - Used: ${originalUsedVolume}→${newUsedVolume}ml, Required: ${originalRequiredVolume}→${newRequiredVolume}ml`,
              previousValue: `Used:${originalUsedVolume},Required:${originalRequiredVolume}`,
              newValue: `Used:${newUsedVolume},Required:${newRequiredVolume}`,
            }),
          );
        }

        // Location change
        if (
          data.wardCode !== undefined ||
          data.districtCode !== undefined ||
          data.provinceCode !== undefined ||
          data.wardName !== undefined ||
          data.districtName !== undefined ||
          data.provinceName !== undefined ||
          data.longitude !== undefined ||
          data.latitude !== undefined
        ) {
          const newWardCode = data.wardCode ?? originalWardCode;
          const newDistrictCode = data.districtCode ?? originalDistrictCode;
          const newProvinceCode = data.provinceCode ?? originalProvinceCode;
          const newWardName = data.wardName ?? originalWardName;
          const newDistrictName = data.districtName ?? originalDistrictName;
          const newProvinceName = data.provinceName ?? originalProvinceName;
          const newLongitude = data.longitude ?? originalLongitude;
          const newLatitude = data.latitude ?? originalLatitude;

          if (
            newWardCode !== originalWardCode ||
            newDistrictCode !== originalDistrictCode ||
            newProvinceCode !== originalProvinceCode ||
            newWardName !== originalWardName ||
            newDistrictName !== originalDistrictName ||
            newProvinceName !== originalProvinceName ||
            newLongitude !== originalLongitude ||
            newLatitude !== originalLatitude
          ) {
            auditPromises.push(
              this.createEmergencyRequestLog({
                emergencyRequestId: id,
                staffId: data.staffId,
                status: EmergencyRequestLogStatus.LOCATION_CHANGE,
                note: `Location changed`,
                previousValue: `${originalWardCode}|${originalDistrictCode}|${originalProvinceCode}|${originalWardName}|${originalDistrictName}|${originalProvinceName}|${originalLongitude}|${originalLatitude}`,
                newValue: `${newWardCode}|${newDistrictCode}|${newProvinceCode}|${newWardName}|${newDistrictName}|${newProvinceName}|${newLongitude}|${newLatitude}`,
              }),
            );
          }
        }

        // Execute all audit records
        await Promise.all(auditPromises);
      }

      this.logger.log(`Emergency request ${id} updated successfully`);
      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error updating emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getEmergencyRequest(
    id: string,
    userId?: string,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodUnit', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      } // Check if user can access this request
      if (userId && emergencyRequest.requestedBy.id !== userId) {
        // Get user to check role by finding the associated account
        const userAccount = await this.em.findOne(Account, { id: userId });
        if (
          userAccount &&
          ![AccountRole.STAFF, AccountRole.ADMIN].includes(userAccount.role)
        ) {
          throw new ForbiddenException(
            'You can only view your own emergency requests',
          );
        }
      }

      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error getting emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteEmergencyRequest(id: string, userId?: string): Promise<void> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      } // Check if user can delete this request
      if (userId && emergencyRequest.requestedBy.id !== userId) {
        // Get user to check role by finding the associated account
        const userAccount = await this.em.findOne(Account, { id: userId });
        if (
          userAccount &&
          ![AccountRole.STAFF, AccountRole.ADMIN].includes(userAccount.role)
        ) {
          throw new ForbiddenException(
            'You can only delete your own emergency requests',
          );
        }
      }

      await this.em.removeAndFlush(emergencyRequest);
      this.logger.log(`Emergency request ${id} deleted successfully`);
    } catch (error: any) {
      this.logger.error(
        `Error deleting emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getEmergencyRequests(
    options: EmergencyRequestListQueryDtoType,
    userId?: string,
  ): Promise<PaginatedResponseType<EmergencyRequest>> {
    try {
      const { page = 1, limit = 10, ...filters } = options;
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.bloodGroup || filters.bloodRh) {
        where.bloodType = {};
        if (filters.bloodGroup) {
          where.bloodType.group = filters.bloodGroup;
        }
        if (filters.bloodRh) {
          where.bloodType.rh = filters.bloodRh;
        }
      }

      if (filters.bloodTypeComponent) {
        where.bloodTypeComponent = filters.bloodTypeComponent;
      }

      if (filters.requestedBy) {
        where.requestedBy = { id: filters.requestedBy };
      } // If userId is provided and user is not STAFF/ADMIN, only show their requests
      if (userId) {
        const userAccount = await this.em.findOne(Account, { id: userId });
        if (
          userAccount &&
          ![AccountRole.STAFF, AccountRole.ADMIN].includes(userAccount.role)
        ) {
          where.requestedBy = { id: userId };
        }
      }

      const [items, total] = await this.em.findAndCount(
        EmergencyRequest,
        where,
        {
          populate: ['requestedBy', 'bloodUnit', 'bloodType'],
          orderBy: { createdAt: 'DESC' },
          limit,
          offset,
        },
      );

      return createPaginatedResponse(items, page, limit, total);
    } catch (error: any) {
      this.logger.error(
        `Error getting emergency requests: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getEmergencyRequestLogs(
    options: EmergencyRequestLogListQueryDtoType,
  ): Promise<PaginatedResponseType<EmergencyRequestLog>> {
    try {
      const { page = 1, limit = 10, ...filters } = options;
      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.emergencyRequestId) {
        where.emergencyRequest = { id: filters.emergencyRequestId };
      }

      if (filters.staffId) {
        where.staff = { id: filters.staffId };
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const [items, total] = await this.em.findAndCount(
        EmergencyRequestLog,
        where,
        {
          populate: ['emergencyRequest', 'staff', 'account'],
          orderBy: { createdAt: 'DESC' },
          limit,
          offset,
        },
      );

      return createPaginatedResponse(items, page, limit, total);
    } catch (error: any) {
      this.logger.error(
        `Error getting emergency request logs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getEmergencyRequestLog(id: string): Promise<EmergencyRequestLog> {
    try {
      const log = await this.em.findOne(
        EmergencyRequestLog,
        { id },
        {
          populate: ['emergencyRequest', 'staff'],
        },
      );

      if (!log) {
        throw new NotFoundException(
          `Emergency request log with ID ${id} not found`,
        );
      }

      return log;
    } catch (error: any) {
      this.logger.error(
        `Error getting emergency request log: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createEmergencyRequestLog(data: {
    emergencyRequestId: string;
    staffId?: string;
    accountId?: string;
    status: string;
    note?: string;
    previousValue?: string;
    newValue?: string;
  }): Promise<EmergencyRequestLog> {
    try {
      // Validate emergency request exists
      const emergencyRequest = await this.em.findOne(EmergencyRequest, {
        id: data.emergencyRequestId,
      });
      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${data.emergencyRequestId} not found`,
        );
      }

      let staff = null;
      let account = null;

      // Validate staff exists if staffId is provided
      if (data.staffId) {
        staff = await this.em.findOne(Staff, { id: data.staffId });
        if (!staff) {
          throw new NotFoundException(
            `Staff with ID ${data.staffId} not found`,
          );
        }
      }

      // Validate account exists if accountId is provided
      if (data.accountId) {
        account = await this.em.findOne(Account, { id: data.accountId });
        if (!account) {
          throw new NotFoundException(
            `Account with ID ${data.accountId} not found`,
          );
        }
      }

      if (!staff && !account) {
        throw new BadRequestException(
          'Either staffId or accountId must be provided',
        );
      }

      const log = new EmergencyRequestLog();
      log.emergencyRequest = emergencyRequest;
      log.staff = staff;
      log.account = account;
      log.status = data.status as EmergencyRequestLogStatus;
      log.note = data.note;
      log.previousValue = data.previousValue;
      log.newValue = data.newValue;

      await this.em.persistAndFlush(log);
      return log;
    } catch (error: any) {
      this.logger.error(
        `Error creating emergency request log: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateEmergencyRequestByUser(
    id: string,
    data: UserUpdateEmergencyRequestDtoType,
    userId: string,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodUnit', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      }

      // Check if user owns this request
      if (emergencyRequest.requestedBy.id !== userId) {
        throw new ForbiddenException(
          'You can only update your own emergency requests',
        );
      }

      // Check if request is still pending (users can only update pending requests)
      if (emergencyRequest.status !== EmergencyRequestStatus.PENDING) {
        throw new BadRequestException(
          'You can only update pending emergency requests',
        );
      }

      // Store original values for audit trail
      const originalRequiredVolume = emergencyRequest.requiredVolume;
      const originalBloodGroup = emergencyRequest.bloodType.group;
      const originalBloodRh = emergencyRequest.bloodType.rh;
      const originalBloodTypeComponent = emergencyRequest.bloodTypeComponent;
      const originalDescription = emergencyRequest.description;
      const originalWardCode = emergencyRequest.wardCode;
      const originalDistrictCode = emergencyRequest.districtCode;
      const originalProvinceCode = emergencyRequest.provinceCode;
      const originalWardName = emergencyRequest.wardName;
      const originalDistrictName = emergencyRequest.districtName;
      const originalProvinceName = emergencyRequest.provinceName;
      const originalLongitude = emergencyRequest.longitude;
      const originalLatitude = emergencyRequest.latitude;

      // Validate blood type if changed
      if (data.bloodGroup || data.bloodRh) {
        const bloodGroup = data.bloodGroup || emergencyRequest.bloodType.group;
        const bloodRh = data.bloodRh || emergencyRequest.bloodType.rh;

        const bloodType = await this.em.findOne(BloodType, {
          group: bloodGroup,
          rh: bloodRh,
        });
        if (!bloodType) {
          throw new NotFoundException(
            `Blood type ${bloodGroup}${bloodRh} not found`,
          );
        }
        emergencyRequest.bloodType = bloodType;
      }

      // Update fields if provided
      if (data.requiredVolume !== undefined)
        emergencyRequest.requiredVolume = data.requiredVolume;
      if (data.bloodTypeComponent !== undefined)
        emergencyRequest.bloodTypeComponent = data.bloodTypeComponent;
      if (data.description !== undefined)
        emergencyRequest.description = data.description;
      if (data.wardCode !== undefined)
        emergencyRequest.wardCode = data.wardCode;
      if (data.districtCode !== undefined)
        emergencyRequest.districtCode = data.districtCode;
      if (data.provinceCode !== undefined)
        emergencyRequest.provinceCode = data.provinceCode;
      if (data.wardName !== undefined)
        emergencyRequest.wardName = data.wardName;
      if (data.districtName !== undefined)
        emergencyRequest.districtName = data.districtName;
      if (data.provinceName !== undefined)
        emergencyRequest.provinceName = data.provinceName;
      if (data.longitude !== undefined)
        emergencyRequest.longitude = data.longitude;
      if (data.latitude !== undefined)
        emergencyRequest.latitude = data.latitude;

      await this.em.flush();

      // Create audit records for changes
      const auditPromises: Promise<any>[] = [];

      // Volume change
      if (
        data.requiredVolume !== undefined &&
        data.requiredVolume !== originalRequiredVolume
      ) {
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: id,
            accountId: userId,
            status: EmergencyRequestLogStatus.VOLUME_CHANGE,
            note: `Volume changed - Required: ${originalRequiredVolume}→${data.requiredVolume}ml`,
            previousValue: `Required:${originalRequiredVolume}`,
            newValue: `Required:${data.requiredVolume}`,
          }),
        );
      }

      // Blood type change
      if (data.bloodGroup && data.bloodGroup !== originalBloodGroup) {
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: id,
            accountId: userId,
            status: EmergencyRequestLogStatus.STATUS_UPDATE,
            note: `Blood group changed from ${originalBloodGroup} to ${data.bloodGroup}`,
            previousValue: originalBloodGroup,
            newValue: data.bloodGroup,
          }),
        );
      }

      if (data.bloodRh && data.bloodRh !== originalBloodRh) {
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: id,
            accountId: userId,
            status: EmergencyRequestLogStatus.STATUS_UPDATE,
            note: `Blood Rh changed from ${originalBloodRh} to ${data.bloodRh}`,
            previousValue: originalBloodRh,
            newValue: data.bloodRh,
          }),
        );
      }

      // Blood component change
      if (
        data.bloodTypeComponent !== undefined &&
        data.bloodTypeComponent !== originalBloodTypeComponent
      ) {
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: id,
            accountId: userId,
            status: EmergencyRequestLogStatus.STATUS_UPDATE,
            note: `Blood component changed from ${originalBloodTypeComponent || 'None'} to ${data.bloodTypeComponent || 'None'}`,
            previousValue: originalBloodTypeComponent || 'None',
            newValue: data.bloodTypeComponent || 'None',
          }),
        );
      }

      // Description change
      if (
        data.description !== undefined &&
        data.description !== originalDescription
      ) {
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: id,
            accountId: userId,
            status: EmergencyRequestLogStatus.STATUS_UPDATE,
            note: `Description updated`,
            previousValue: originalDescription || 'None',
            newValue: data.description || 'None',
          }),
        );
      }

      // Location change
      if (
        data.wardCode !== undefined ||
        data.districtCode !== undefined ||
        data.provinceCode !== undefined ||
        data.wardName !== undefined ||
        data.districtName !== undefined ||
        data.provinceName !== undefined ||
        data.longitude !== undefined ||
        data.latitude !== undefined
      ) {
        const newWardCode = data.wardCode ?? originalWardCode;
        const newDistrictCode = data.districtCode ?? originalDistrictCode;
        const newProvinceCode = data.provinceCode ?? originalProvinceCode;
        const newWardName = data.wardName ?? originalWardName;
        const newDistrictName = data.districtName ?? originalDistrictName;
        const newProvinceName = data.provinceName ?? originalProvinceName;
        const newLongitude = data.longitude ?? originalLongitude;
        const newLatitude = data.latitude ?? originalLatitude;

        if (
          newWardCode !== originalWardCode ||
          newDistrictCode !== originalDistrictCode ||
          newProvinceCode !== originalProvinceCode ||
          newWardName !== originalWardName ||
          newDistrictName !== originalDistrictName ||
          newProvinceName !== originalProvinceName ||
          newLongitude !== originalLongitude ||
          newLatitude !== originalLatitude
        ) {
          auditPromises.push(
            this.createEmergencyRequestLog({
              emergencyRequestId: id,
              accountId: userId,
              status: EmergencyRequestLogStatus.LOCATION_CHANGE,
              note: `Location changed`,
              previousValue: `${originalWardCode}|${originalDistrictCode}|${originalProvinceCode}|${originalWardName}|${originalDistrictName}|${originalProvinceName}|${originalLongitude}|${originalLatitude}`,
              newValue: `${newWardCode}|${newDistrictCode}|${newProvinceCode}|${newWardName}|${newDistrictName}|${newProvinceName}|${newLongitude}|${newLatitude}`,
            }),
          );
        }
      }

      // Execute all audit records
      await Promise.all(auditPromises);

      this.logger.log(`Emergency request ${id} updated by user ${userId}`);
      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error updating emergency request by user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async approveEmergencyRequest(
    id: string,
    data: ApproveEmergencyRequestDtoType,
    staffId: string,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodUnit', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      }

      if (emergencyRequest.status !== EmergencyRequestStatus.PENDING) {
        throw new BadRequestException(
          'Only pending emergency requests can be approved',
        );
      }

      // Only approve requests from hospitals
      if (emergencyRequest.requestedBy.role !== AccountRole.HOSPITAL) {
        throw new BadRequestException(
          'Only hospital emergency requests can be approved',
        );
      }

      // Validate blood unit exists
      const bloodUnit = await this.em.findOne(BloodUnit, {
        id: data.bloodUnitId,
      });
      if (!bloodUnit) {
        throw new NotFoundException(
          `Blood unit with ID ${data.bloodUnitId} not found`,
        );
      }

      // Validate used volume against required volume
      if (data.usedVolume > emergencyRequest.requiredVolume) {
        throw new BadRequestException(
          'Used volume cannot be greater than required volume',
        );
      }

      // Validate against blood unit volume
      if (data.usedVolume > bloodUnit.remainingVolume) {
        throw new BadRequestException(
          `Used volume (${data.usedVolume}ml) exceeds available volume (${bloodUnit.remainingVolume}ml)`,
        );
      }

      // Store original values for audit trail
      const originalBloodUnitId = emergencyRequest.bloodUnit?.id || null;
      const originalUsedVolume = emergencyRequest.usedVolume;
      const originalStatus = emergencyRequest.status;

      // Store original blood unit values for audit trail
      const originalBloodUnitRemainingVolume = bloodUnit.remainingVolume;
      const originalBloodUnitStatus = bloodUnit.status;

      // Update emergency request
      emergencyRequest.bloodUnit = bloodUnit;
      emergencyRequest.usedVolume = data.usedVolume;
      emergencyRequest.status = EmergencyRequestStatus.APPROVED;

      // Update blood unit remaining volume
      bloodUnit.remainingVolume = bloodUnit.remainingVolume - data.usedVolume;

      // Update blood unit status to "used" if remaining volume reaches 0
      if (bloodUnit.remainingVolume <= 0) {
        bloodUnit.status = BloodUnitStatus.USED;
      }

      await this.em.flush();

      // Create audit log for approval
      await this.createEmergencyRequestLog({
        emergencyRequestId: id,
        staffId,
        status: EmergencyRequestLogStatus.APPROVAL,
        note: `Emergency request approved - Blood unit ${data.bloodUnitId} assigned with ${data.usedVolume}ml`,
        previousValue: `Status: ${originalStatus}, BloodUnit: ${originalBloodUnitId}, UsedVolume: ${originalUsedVolume}ml`,
        newValue: `Status: ${EmergencyRequestStatus.APPROVED}, BloodUnit: ${data.bloodUnitId}, UsedVolume: ${data.usedVolume}ml`,
      });

      this.logger.log(
        `Emergency request ${id} approved by staff ${staffId} - Blood unit ${data.bloodUnitId} assigned with ${data.usedVolume}ml - Blood unit remaining volume updated from ${originalBloodUnitRemainingVolume}ml to ${bloodUnit.remainingVolume}ml${bloodUnit.status === BloodUnitStatus.USED ? ' (status changed to USED)' : ''}`,
      );

      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error approving emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async rejectEmergencyRequest(
    id: string,
    rejectionReason: string,
    staffId: string,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      }

      if (emergencyRequest.status === EmergencyRequestStatus.REJECTED) {
        throw new BadRequestException('Emergency request is already rejected');
      }

      if (emergencyRequest.requestedBy.role !== AccountRole.HOSPITAL) {
        throw new BadRequestException(
          'Only hospital can be rejected in this case',
        );
      }

      const originalStatus = emergencyRequest.status;
      emergencyRequest.status = EmergencyRequestStatus.REJECTED;
      emergencyRequest.rejectionReason = rejectionReason;

      await this.em.flush();

      // Create audit log
      await this.createEmergencyRequestLog({
        emergencyRequestId: id,
        staffId,
        status: EmergencyRequestLogStatus.REJECTION,
        note: `Emergency request rejected: ${rejectionReason}`,
        previousValue: originalStatus,
        newValue: EmergencyRequestStatus.REJECTED,
      });

      this.logger.log(
        `Emergency request ${id} rejected by staff ${staffId}: ${rejectionReason}`,
      );

      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error rejecting emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async rejectEmergencyRequestsByBloodType(
    bloodGroup: BloodGroup,
    bloodRh: BloodRh,
    bloodTypeComponent: BloodTypeComponent | undefined,
    rejectionReason: string,
    staffId: string,
  ): Promise<{ rejectedCount: number; rejectedIds: string[] }> {
    try {
      // Build where clause to find emergency requests
      const where: any = {
        status: EmergencyRequestStatus.PENDING,
        bloodType: {
          group: bloodGroup,
          rh: bloodRh,
        },
      };

      if (bloodTypeComponent) {
        where.bloodTypeComponent = bloodTypeComponent;
      }

      const emergencyRequests = await this.em.find(EmergencyRequest, where, {
        populate: ['requestedBy', 'bloodType'],
      });

      if (emergencyRequests.length === 0) {
        throw new NotFoundException(
          `No pending emergency requests found for blood type ${bloodGroup}${bloodRh}${bloodTypeComponent ? ` (${bloodTypeComponent})` : ''}`,
        );
      }

      const rejectedIds: string[] = [];
      const auditPromises: Promise<any>[] = [];

      // Update all matching emergency requests (only from hospitals)
      for (const request of emergencyRequests) {
        // Only reject requests from hospitals
        if (request.requestedBy.role !== AccountRole.HOSPITAL) {
          continue;
        }

        const originalStatus = request.status;
        request.status = EmergencyRequestStatus.REJECTED;
        request.rejectionReason = rejectionReason;
        rejectedIds.push(request.id);

        // Create audit log for each rejection
        auditPromises.push(
          this.createEmergencyRequestLog({
            emergencyRequestId: request.id,
            staffId,
            status: EmergencyRequestLogStatus.MULTIPLE_REJECTIONS,
            note: `Emergency request rejected (bulk): ${rejectionReason}`,
            previousValue: originalStatus,
            newValue: EmergencyRequestStatus.REJECTED,
          }),
        );
      }

      await this.em.flush();

      // Create all audit logs
      await Promise.all(auditPromises);

      this.logger.log(
        `Bulk rejected ${rejectedIds.length} emergency requests for blood type ${bloodGroup}${bloodRh}${bloodTypeComponent ? ` (${bloodTypeComponent})` : ''} by staff ${staffId}: ${rejectionReason}`,
      );

      return {
        rejectedCount: rejectedIds.length,
        rejectedIds,
      };
    } catch (error: any) {
      this.logger.error(
        `Error bulk rejecting emergency requests: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async provideContactsForEmergencyRequest(
    id: string,
    suggestedContacts: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      phone?: string;
      bloodType: {
        group: string;
        rh: string;
      };
    }[],
    staffId: string,
  ): Promise<EmergencyRequest> {
    try {
      const emergencyRequest = await this.em.findOne(
        EmergencyRequest,
        { id },
        {
          populate: ['requestedBy', 'bloodType'],
        },
      );

      if (!emergencyRequest) {
        throw new NotFoundException(
          `Emergency request with ID ${id} not found`,
        );
      }

      // Only allow providing contacts for USER emergency requests
      if (emergencyRequest.requestedBy.role !== AccountRole.USER) {
        throw new BadRequestException(
          'Contacts can only be provided for user emergency requests',
        );
      }

      // Only allow providing contacts for PENDING requests
      if (emergencyRequest.status !== EmergencyRequestStatus.PENDING) {
        throw new BadRequestException(
          'Contacts can only be provided for pending emergency requests',
        );
      }

      const originalStatus = emergencyRequest.status;
      const originalContacts = emergencyRequest.suggestedContacts;

      // Update the emergency request with suggested contacts
      emergencyRequest.suggestedContacts = suggestedContacts;
      emergencyRequest.status = EmergencyRequestStatus.CONTACTS_PROVIDED;

      await this.em.flush();

      // Create audit log for providing contacts
      await this.createEmergencyRequestLog({
        emergencyRequestId: id,
        staffId,
        status: EmergencyRequestLogStatus.CONTACTS_PROVIDED,
        note: `Staff provided ${suggestedContacts.length} contact(s) for user emergency request`,
        previousValue: `Status: ${originalStatus}, Contacts: ${originalContacts ? originalContacts.length : 0}`,
        newValue: `Status: ${EmergencyRequestStatus.CONTACTS_PROVIDED}, Contacts: ${suggestedContacts.length}`,
      });

      this.logger.log(
        `Staff ${staffId} provided ${suggestedContacts.length} contacts for emergency request ${id}`,
      );

      return emergencyRequest;
    } catch (error: any) {
      this.logger.error(
        `Error providing contacts for emergency request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
