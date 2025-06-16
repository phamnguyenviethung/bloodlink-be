import { RolesGuard } from '@/share/guards/roles.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { Roles } from '@/share/decorators/role.decorator';
import { AccountRole } from '@/database/entities/Account.entity';
import {
  BloodUnitStatus,
  BloodUnitAction,
} from '@/database/entities/inventory.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import {
  CreateBloodUnitDto,
  UpdateBloodUnitDto,
  BloodUnitResponseDto,
  BloodUnitListQueryDto,
} from './dtos/blood-unit.dto';
import {
  CreateBloodUnitActionDto,
  BloodUnitActionResponseDto,
  BloodUnitActionListQueryDto,
} from './dtos/blood-unit-action.dto';
import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import { RequestWithUser } from '@/share/types/request.type';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(ClerkAdminAuthGuard, RolesGuard)
@Roles(AccountRole.STAFF)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Blood Unit endpoints
  @Post('blood-units')
  @ApiOperation({ summary: 'Create a new blood unit' })
  @ApiResponse({
    status: 201,
    description: 'Blood unit created successfully',
    type: BloodUnitResponseDto,
  })
  @Roles(AccountRole.STAFF)
  async createBloodUnit(@Body() createBloodUnitDto: CreateBloodUnitDto) {
    return this.inventoryService.createBloodUnit(createBloodUnitDto);
  }

  @Get('blood-units')
  @ApiOperation({ summary: 'Get all blood units with pagination and filters' })
  @ApiPaginatedResponse(BloodUnitResponseDto)
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
  @Roles(AccountRole.STAFF)
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
  @Post('blood-unit-actions')
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
  }

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
