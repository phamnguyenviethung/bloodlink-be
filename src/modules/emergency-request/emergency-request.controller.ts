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
import { AccountRole, StaffRole } from '@/database/entities/Account.entity';
import {
  EmergencyRequestStatus,
  BloodTypeComponent,
  EmergencyRequestLogStatus,
} from '@/database/entities/emergency-request.entity';
import { BloodGroup, BloodRh } from '@/database/entities/Blood.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import {
  CreateEmergencyRequestDto,
  UserUpdateEmergencyRequestDto,
  ApproveEmergencyRequestDto,
  EmergencyRequestResponseDto,
  EmergencyRequestListQueryDto,
  EmergencyRequestLogResponseDto,
  EmergencyRequestLogListQueryDto,
  RejectEmergencyRequestDto,
  RejectEmergencyRequestsByBloodTypeDto,
} from './dtos';
import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import { RequestWithUser } from '@/share/types/request.type';
import { AuthenticatedGuard } from '../auth/guard/authenticated.guard';
import { StaffRoleGuard, StaffRoles } from '../auth/guard/staffRole.guard';
import { CombinedRoleGuard } from '../auth/guard/combinedRole.guard';

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
  @UseGuards(AuthenticatedGuard, CombinedRoleGuard)
  @Roles(AccountRole.USER, AccountRole.STAFF, AccountRole.HOSPITAL)
  @StaffRoles(StaffRole.STAFF)
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
    summary: 'Update an emergency request (User/Hospital only)',
    description:
      'Users and hospitals can update basic information of their emergency requests. Staff should use the approve endpoint.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request updated successfully',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles(AccountRole.USER, AccountRole.HOSPITAL)
  async updateEmergencyRequest(
    @Param('id') id: string,
    @Body() userUpdateEmergencyRequestDto: UserUpdateEmergencyRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.updateEmergencyRequestByUser(
      id,
      userUpdateEmergencyRequestDto,
      request.user!.id,
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

  @Patch(':id/approve')
  @ApiOperation({
    summary:
      'Approve an emergency request by assigning blood unit (Staff with role "staff" only)',
    description:
      'Staff can approve emergency requests by assigning blood unit and setting used volume.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request approved successfully',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async approveEmergencyRequest(
    @Param('id') id: string,
    @Body() approveDto: ApproveEmergencyRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.approveEmergencyRequest(
      id,
      approveDto,
      request.user!.id,
    );
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject an emergency request (Staff with role "staff" only)',
    description: 'Only STAFF can reject emergency requests with a reason.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Emergency request ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency request rejected successfully',
    type: EmergencyRequestResponseDto,
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async rejectEmergencyRequest(
    @Param('id') id: string,
    @Body() rejectDto: RejectEmergencyRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.rejectEmergencyRequest(
      id,
      rejectDto.rejectionReason,
      request.user!.id,
    );
  }

  @Patch('reject-by-blood-type')
  @ApiOperation({
    summary:
      'Reject all emergency requests with specific blood type (Staff with role "staff" only)',
    description:
      'Only STAFF can bulk reject emergency requests by blood type when supplies are unavailable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency requests rejected successfully',
    schema: {
      type: 'object',
      properties: {
        rejectedCount: { type: 'number' },
        rejectedIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async rejectEmergencyRequestsByBloodType(
    @Body() rejectDto: RejectEmergencyRequestsByBloodTypeDto,
    @Req() request: RequestWithUser,
  ) {
    return this.emergencyRequestService.rejectEmergencyRequestsByBloodType(
      rejectDto.bloodGroup,
      rejectDto.bloodRh,
      rejectDto.bloodTypeComponent,
      rejectDto.rejectionReason,
      request.user!.id,
    );
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
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
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
  @UseGuards(ClerkAdminAuthGuard, StaffRoleGuard)
  @StaffRoles(StaffRole.STAFF)
  async getEmergencyRequestLog(@Param('id') id: string) {
    return this.emergencyRequestService.getEmergencyRequestLog(id);
  }
}
