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
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'before_donation', 'after_donation'],
    description:
      'Filter reminders by type: all, before_donation (preparation tips), after_donation (care instructions)',
  })
  async getDonorReminders(
    @Param('donorId') donorId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: 'all' | 'before_donation' | 'after_donation',
  ) {
    return this.reminderService.getDonorReminders(donorId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filter,
    });
  }

  @Get('my')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get reminders for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'before_donation', 'after_donation'],
    description:
      'Filter reminders by type: all, before_donation (preparation tips), after_donation (care instructions)',
  })
  async getMyReminders(
    @Req() req: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: 'all' | 'before_donation' | 'after_donation',
  ) {
    const donorId = req.user.id;
    return this.reminderService.getDonorReminders(donorId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filter,
    });
  }

  @Get('my/active')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({
    summary: "Get reminders for current user's most recent donation request",
  })
  async getMyActiveReminders(@Req() req: RequestWithUser) {
    const donorId = req.user.id;
    return this.reminderService.getActiveReminders(donorId);
  }
}
