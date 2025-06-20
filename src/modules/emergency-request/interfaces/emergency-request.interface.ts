import {
  EmergencyRequest,
  EmergencyRequestLog,
  EmergencyRequestStatus,
  BloodTypeComponent,
} from '@/database/entities/emergency-request.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { PaginatedResponseType } from '@/share/dtos/pagination.dto';
import {
  CreateEmergencyRequestDtoType,
  UpdateEmergencyRequestDtoType,
  EmergencyRequestListQueryDtoType,
  EmergencyRequestLogListQueryDtoType,
} from '../dtos';

export interface IEmergencyRequestService {
  // Emergency Request methods
  createEmergencyRequest(
    data: CreateEmergencyRequestDtoType,
    requestedById: string,
  ): Promise<EmergencyRequest>;

  updateEmergencyRequest(
    id: string,
    data: UpdateEmergencyRequestDtoType,
  ): Promise<EmergencyRequest>;

  getEmergencyRequest(id: string, userId?: string): Promise<EmergencyRequest>;

  deleteEmergencyRequest(id: string, userId?: string): Promise<void>;

  getEmergencyRequests(
    options: EmergencyRequestListQueryDtoType,
    userId?: string,
  ): Promise<PaginatedResponseType<EmergencyRequest>>;

  // Emergency Request Log methods
  getEmergencyRequestLogs(
    options: EmergencyRequestLogListQueryDtoType,
  ): Promise<PaginatedResponseType<EmergencyRequestLog>>;

  getEmergencyRequestLog(id: string): Promise<EmergencyRequestLog>;

  // Internal audit method
  createEmergencyRequestLog(data: {
    emergencyRequestId: string;
    staffId: string;
    status: string;
    note?: string;
    previousValue?: string;
    newValue?: string;
  }): Promise<EmergencyRequestLog>;
}
