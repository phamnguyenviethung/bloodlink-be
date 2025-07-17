import { AccountRole } from "@/database/entities/Account.entity";
import {
  BloodUnitAction,
  BloodUnitStatus,
} from "@/database/entities/inventory.entity";
import { ApiPaginatedResponse } from "@/share/decorators/api-paginated-response.decorator";
import { Public, Roles } from "@/share/decorators/role.decorator";
import { RolesGuard } from "@/share/guards/roles.guard";
import { RequestWithUser } from "@/share/types/request.type";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ClerkAdminAuthGuard } from "../auth/guard/clerkAdmin.guard";
import {
  BloodCompatibilityQueryDto,
  BloodComponentCompatibilityQueryDto,
  BloodUnitActionListQueryDto,
  BloodUnitActionResponseDto,
  BloodUnitListQueryDto,
  BloodUnitResponseDto,
  CreateWholeBloodUnitDto,
  SeparateBloodComponentsDto,
  SeparateBloodComponentsResponseDto,
  UpdateBloodUnitDto,
} from "./dtos";
import { InventoryService } from "./inventory.service";

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(ClerkAdminAuthGuard, RolesGuard)
@Roles(AccountRole.STAFF)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Blood Unit endpoints
  @Post('blood-units/whole-blood')
  @ApiOperation({ summary: 'Create a new whole blood unit' })
  @ApiResponse({
    status: 201,
    description: 'Whole blood unit created successfully',
    type: BloodUnitResponseDto,
  })
  @Roles(AccountRole.STAFF)
  async createWholeBloodUnit(
    @Body() createWholeBloodUnitDto: CreateWholeBloodUnitDto,
  ) {
    return this.inventoryService.createWholeBloodUnit(createWholeBloodUnitDto);
  }

  @Post('blood-units/separate-components')
  @ApiOperation({
    summary: 'Separate whole blood unit into components',
    description:
      'Separates a whole blood unit into red cells, plasma, and platelets components. The original whole blood unit will be marked as used and separated.',
  })
  @ApiResponse({
    status: 201,
    description: 'Blood components separated successfully',
    type: SeparateBloodComponentsResponseDto,
  })
  @Roles(AccountRole.STAFF)
  async separateBloodComponents(
    @Body() separateBloodComponentsDto: SeparateBloodComponentsDto,
  ) {
    return this.inventoryService.separateBloodComponents(
      separateBloodComponentsDto,
    );
  }

  // Blood compatibility search endpoints
  @Get('blood-units/compatibility/whole-blood')
  @ApiOperation({
    summary: 'Search compatible blood units for whole blood transfusion',
    description:
      'Find blood units compatible for whole blood transfusion based on ABO/Rh compatibility rules. For example: A+ recipients can receive from A+, A-, O+, O- donors.',
  })
  @ApiPaginatedResponse(BloodUnitResponseDto)
  @Public()
  async searchCompatibleBloodUnitsForWholeBlood(
    @Query() query: BloodCompatibilityQueryDto,
  ) {
    return this.inventoryService.searchCompatibleBloodUnitsForWholeBlood(
      query.bloodGroup,
      query.bloodRh,
      {
        page: query.page,
        limit: query.limit,
        status: query.status,
        expired: query.expired,
      },
    );
  }

  @Get('blood-units/compatibility/components')
  @ApiOperation({
    summary: 'Search compatible blood units for blood component transfusion',
    description:
      'Find blood units compatible for specific blood component transfusion (RBC, Plasma, Platelets). Each component has different compatibility rules: RBC follows whole blood rules, Plasma has reverse compatibility, Platelets are less restrictive.',
  })
  @ApiPaginatedResponse(BloodUnitResponseDto)
  @Public()
  async searchCompatibleBloodUnitsForComponent(
    @Query() query: BloodComponentCompatibilityQueryDto,
  ) {
    return this.inventoryService.searchCompatibleBloodUnitsForComponent(
      query.bloodGroup,
      query.bloodRh,
      query.componentType,
      {
        page: query.page,
        limit: query.limit,
        status: query.status,
        expired: query.expired,
      },
    );
  }

  @Get('blood-units')
  @ApiOperation({ summary: 'Get all blood units with pagination and filters' })
  @ApiPaginatedResponse(BloodUnitResponseDto)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    default: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    default: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BloodUnitStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'bloodType',
    required: false,
    type: String,
    description: 'Filter by blood type',
  })
  @ApiQuery({
    name: 'expired',
    required: false,
    type: Boolean,
    description: 'Filter by expiration status',
  })
  @Public()
  async getBloodUnits(@Query() query: BloodUnitListQueryDto) {
    return this.inventoryService.getBloodUnits({
      page: query.page || 1,
      limit: query.limit || 10,
      status: query.status,
      bloodType: query.bloodType,
      expired: query.expired,
    });
  }

  @Get('blood-units/:id')
  @ApiOperation({ summary: 'Get a blood unit by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Blood unit ID' })
  @ApiResponse({
    status: 200,
    description: 'Blood unit found',
    type: BloodUnitResponseDto,
  })
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  async getBloodUnit(@Param('id') id: string) {
    return this.inventoryService.getBloodUnit(id);
  }
  @Patch('blood-units/:id')
  @ApiOperation({ summary: 'Update a blood unit' })
  @ApiParam({ name: 'id', type: String, description: 'Blood unit ID' })
  @ApiResponse({
    status: 200,
    description: 'Blood unit updated successfully',
    type: BloodUnitResponseDto,
  })
  @Roles(AccountRole.STAFF)
  async updateBloodUnit(
    @Param('id') id: string,
    @Body() updateBloodUnitDto: UpdateBloodUnitDto,
    @Req() request: RequestWithUser,
  ) {
    // Automatically inject the staff ID from the authenticated user
    updateBloodUnitDto.staffId = request.user.id;

    return this.inventoryService.updateBloodUnit(id, updateBloodUnitDto);
  }

  @Delete('blood-units/:id')
  @ApiOperation({ summary: 'Delete a blood unit' })
  @ApiParam({ name: 'id', type: String, description: 'Blood unit ID' })
  @ApiResponse({ status: 200, description: 'Blood unit deleted successfully' })
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  async deleteBloodUnit(@Param('id') id: string) {
    await this.inventoryService.deleteBloodUnit(id);
    return { success: true, message: 'Blood unit deleted successfully' };
  }

  // Blood Unit Actions endpoints
  /* @Post('blood-unit-actions')
  @ApiOperation({ summary: 'Create a new blood unit action record' })
  @ApiResponse({
    status: 201,
    description: 'Blood unit action created successfully',
    type: BloodUnitActionResponseDto,
  })
  @Roles(AccountRole.STAFF)
  async createBloodUnitAction(
    @Body() createBloodUnitActionDto: CreateBloodUnitActionDto,
  ) {
    return this.inventoryService.createBloodUnitAction(
      createBloodUnitActionDto,
    );
  } */

  @Get('blood-unit-actions')
  @ApiOperation({
    summary: 'Get all blood unit actions with pagination and filters',
  })
  @ApiPaginatedResponse(BloodUnitActionResponseDto)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: BloodUnitAction,
    description: 'Filter by action type',
  })
  @ApiQuery({
    name: 'bloodUnitId',
    required: false,
    type: String,
    description: 'Filter by blood unit ID',
  })
  @ApiQuery({
    name: 'staffId',
    required: false,
    type: String,
    description: 'Filter by staff ID',
  })
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  async getBloodUnitActions(@Query() query: BloodUnitActionListQueryDto) {
    return this.inventoryService.getBloodUnitActions({
      page: query.page || 1,
      limit: query.limit || 10,
      action: query.action,
      bloodUnitId: query.bloodUnitId,
      staffId: query.staffId,
    });
  }
  @Get('blood-unit-actions/:id')
  @ApiOperation({ summary: 'Get a blood unit action by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Blood unit action ID' })
  @ApiResponse({
    status: 200,
    description: 'Blood unit action found',
    type: BloodUnitActionResponseDto,
  })
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  async getBloodUnitAction(@Param('id') id: string) {
    return this.inventoryService.getBloodUnitAction(id);
  }
}
