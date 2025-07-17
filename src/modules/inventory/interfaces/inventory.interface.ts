import { BloodGroup, BloodRh } from "@/database/entities/Blood.entity";
import {
  BloodUnit,
  BloodUnitAction,
  BloodUnitActions,
  BloodUnitStatus,
} from "@/database/entities/inventory.entity";
import { PaginatedResponseType } from "@/share/dtos/pagination.dto";

import {
  CreateBloodUnitActionDtoType,
  CreateBloodUnitDtoType,
  CreateWholeBloodUnitDtoType,
  SeparateBloodComponentsDtoType,
  UpdateBloodUnitDtoType,
} from "../dtos";

export interface IInventoryService {
  // BloodUnit methods
  createBloodUnit(data: CreateBloodUnitDtoType): Promise<BloodUnit>;
  createWholeBloodUnit(data: CreateWholeBloodUnitDtoType): Promise<BloodUnit>;
  separateBloodComponents(data: SeparateBloodComponentsDtoType): Promise<{
    wholeBloodUnit: BloodUnit;
    redCellsUnit: BloodUnit;
    plasmaUnit: BloodUnit;
    plateletsUnit: BloodUnit;
  }>;
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

  // Blood compatibility search methods
  searchCompatibleBloodUnitsForWholeBlood(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
    options?: {
      page?: number;
      limit?: number;
      status?: BloodUnitStatus;
      expired?: boolean;
    },
  ): Promise<PaginatedResponseType<BloodUnit>>;

  searchCompatibleBloodUnitsForComponent(
    recipientBloodGroup: BloodGroup,
    recipientRh: BloodRh,
    componentType: 'RBC' | 'PLASMA' | 'PLATELETS',
    options?: {
      page?: number;
      limit?: number;
      status?: BloodUnitStatus;
      expired?: boolean;
    },
  ): Promise<PaginatedResponseType<BloodUnit>>;

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
