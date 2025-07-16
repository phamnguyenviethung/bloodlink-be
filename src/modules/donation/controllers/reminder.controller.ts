import { ReminderStatus } from '@/database/entities/campaign.entity';
import { Roles } from '@/share/decorators/role.decorator';
import { AccountRole } from '@/database/entities/Account.entity';
import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReminderService } from '../services/reminder.service';
import { AuthenticatedGuard } from '@/modules/auth/guard/authenticated.guard';
import { RolesGuard } from '@/share/guards/roles.guard';
import { RequestWithUser } from '@/share/types/request.type';

@ApiTags('Reminders')
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get('donor/:donorId')
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @ApiOperation({ summary: 'Get reminders for a donor' })
  @ApiParam({ name: 'donorId', description: 'ID of the donor' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ReminderStatus })
  async getDonorReminders(
    @Param('donorId') donorId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ReminderStatus,
  ) {
    return this.reminderService.getDonorReminders(donorId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get('my')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get reminders for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ReminderStatus })
  async getMyReminders(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ReminderStatus,
  ) {
    const donorId = req.user.id;
    return this.reminderService.getDonorReminders(donorId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get('pending')
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @ApiOperation({ summary: 'Get pending reminders that are due' })
  async getPendingReminders() {
    const reminders = await this.reminderService.getPendingReminders();
    return { items: reminders, total: reminders.length };
  }
}
