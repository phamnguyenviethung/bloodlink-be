import {
  BloodUnit,
  BloodUnitActions,
  BloodUnitStatus,
  BloodUnitAction,
} from '@/database/entities/inventory.entity';
import { PaginatedResponseType } from '@/share/dtos/pagination.dto';
import {
  CreateBloodUnitDtoType,
  UpdateBloodUnitDtoType,
  CreateBloodUnitActionDtoType,
} from '../dtos';

export interface IInventoryService {
  // BloodUnit methods
  createBloodUnit(data: CreateBloodUnitDtoType): Promise<BloodUnit>;
  updateBloodUnit(id: string, data: UpdateBloodUnitDtoType): Promise<BloodUnit>;
  getBloodUnit(id: string): Promise<BloodUnit>;
  deleteBloodUnit(id: string): Promise<void>;
  getBloodUnits(options: {
    page?: number;
    limit?: number;
    status?: BloodUnitStatus;
    bloodType?: string;
    expired?: boolean;
  }): Promise<PaginatedResponseType<BloodUnit>>;

  // BloodUnitAction methods
  createBloodUnitAction(
    data: CreateBloodUnitActionDtoType,
  ): Promise<BloodUnitActions>;
  getBloodUnitActions(options: {
    page?: number;
    limit?: number;
    action?: BloodUnitAction;
    bloodUnitId?: string;
    staffId?: string;
  }): Promise<PaginatedResponseType<BloodUnitActions>>;
  getBloodUnitAction(id: string): Promise<BloodUnitActions>;
}
