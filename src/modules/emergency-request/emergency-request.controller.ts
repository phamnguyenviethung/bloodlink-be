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
import { EmergencyRequestService } from './emergency-request.service';
import { Public, Roles } from '@/share/decorators/role.decorator';
import { AccountRole } from '@/database/entities/Account.entity';
import {
  EmergencyRequestStatus,
  BloodTypeComponent,
  EmergencyRequestLogStatus,
} from '@/database/entities/emergency-request.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import {
  CreateEmergencyRequestDto,
  UpdateEmergencyRequestDto,
  EmergencyRequestResponseDto,
  EmergencyRequestListQueryDto,
  EmergencyRequestLogResponseDto,
  EmergencyRequestLogListQueryDto,
} from './dtos';
import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import { RequestWithUser } from '@/share/types/request.type';
import { ClerkAuthGuard } from '../auth/guard/clerk.guard';
import { AuthenticatedGuard } from '../auth/guard/authenticated.guard';

@ApiTags('Emergency Request')
@Controller('emergency-requests')
export class EmergencyRequestController {
  constructor(
    private readonly emergencyRequestService: EmergencyRequestService,
  ) {}

  // Emergency Request endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new emergency request' })
  @ApiResponse({
    status: 201,
    description: 'Emergency request created successfully',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.HOSPITAL)
  async createEmergencyRequest(
    @Body() createEmergencyRequestDto: CreateEmergencyRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.createEmergencyRequest(
      createEmergencyRequestDto,
      request.user!.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all emergency requests with pagination and filters',
    description:
      'Users can only see their own requests, while STAFF and ADMIN can see all requests.',
  })
  @ApiPaginatedResponse(EmergencyRequestResponseDto)
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
    enum: EmergencyRequestStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'bloodGroup',
    required: false,
    enum: BloodGroup,
    description: 'Filter by blood group',
  })
  @ApiQuery({
    name: 'bloodRh',
    required: false,
    enum: BloodRh,
    description: 'Filter by blood Rh',
  })
  @ApiQuery({
    name: 'bloodTypeComponent',
    required: false,
    enum: BloodTypeComponent,
    description: 'Filter by blood component type',
  })
  @ApiQuery({
    name: 'requestedBy',
    required: false,
    type: String,
    description: 'Filter by requester ID (STAFF/ADMIN only)',
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.STAFF, AccountRole.HOSPITAL)
  async getEmergencyRequests(
    @Query() query: EmergencyRequestListQueryDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.getEmergencyRequests(
      {
        page: query.page || 1,
        limit: query.limit || 10,
        status: query.status,
        bloodGroup: query.bloodGroup,
        bloodRh: query.bloodRh,
        bloodTypeComponent: query.bloodTypeComponent,
        requestedBy: query.requestedBy,
      },
      request.user?.id,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an emergency request by ID',
    description:
      'Users can only see their own requests, while STAFF and ADMIN can see any request.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request found',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.STAFF, AccountRole.HOSPITAL)
  async getEmergencyRequest(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.getEmergencyRequest(
      id,
      request.user?.id,
    );
  }
  @Patch(':id')
  @ApiOperation({
    summary: 'Update an emergency request',
    description:
      'All roles can update emergency requests. Audit logs are automatically created for staff actions.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request updated successfully',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.STAFF, AccountRole.HOSPITAL)
  async updateEmergencyRequest(
    @Param('id') id: string,
    @Body() updateEmergencyRequestDto: UpdateEmergencyRequestDto,
    @Req() request: RequestWithUser,
  ) {
    // Automatically inject the user ID for audit trail if it's a staff member
    // Check if user is Staff type
    if (request.user && 'role' in request.user) {
      updateEmergencyRequestDto.staffId = request.user.id;
    }

    return this.emergencyRequestService.updateEmergencyRequest(
      id,
      updateEmergencyRequestDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an emergency request',
    description:
      'Users can only delete their own requests, while STAFF and ADMIN can delete any request.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request deleted successfully',
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.STAFF, AccountRole.HOSPITAL)
  async deleteEmergencyRequest(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    await this.emergencyRequestService.deleteEmergencyRequest(
      id,
      request.user?.id,
    );
    return { success: true, message: 'Emergency request deleted successfully' };
  }

  // Emergency Request Log endpoints (STAFF only)
  @Get('logs/all')
  @ApiOperation({
    summary: 'Get all emergency request logs with pagination and filters',
    description: 'Only STAFF can view emergency request logs.',
  })
  @ApiPaginatedResponse(EmergencyRequestLogResponseDto)
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
    name: 'emergencyRequestId',
    required: false,
    type: String,
    description: 'Filter by emergency request ID',
  })
  @ApiQuery({
    name: 'staffId',
    required: false,
    type: String,
    description: 'Filter by staff ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EmergencyRequestLogStatus,
    description: 'Filter by log status/action type',
  })
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.STAFF)
  async getEmergencyRequestLogs(
    @Query() query: EmergencyRequestLogListQueryDto,
  ) {
    return this.emergencyRequestService.getEmergencyRequestLogs({
      page: query.page || 1,
      limit: query.limit || 10,
      emergencyRequestId: query.emergencyRequestId,
      staffId: query.staffId,
      status: query.status,
    });
  }

  @Get('logs/:id')
  @ApiOperation({
    summary: 'Get an emergency request log by ID',
    description: 'Only STAFF can view emergency request logs.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Emergency request log ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency request log found',
    type: EmergencyRequestLogResponseDto,
  })
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.STAFF)
  async getEmergencyRequestLog(@Param('id') id: string) {
    return this.emergencyRequestService.getEmergencyRequestLog(id);
  }
}
