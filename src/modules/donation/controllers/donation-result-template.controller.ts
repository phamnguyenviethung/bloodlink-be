import { AccountRole } from '@/database/entities/Account.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';
import { RequestWithUser } from '@/share/types/request.type';
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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
import {
  CreateDonationResultTemplateDto,
  DonationResultTemplateQueryDto,
  DonationResultTemplateResponseDto,
  UpdateDonationResultTemplateDto,
} from '../dtos/donation-result-template.dto';
import { DonationResultTemplateService } from '../services/donation-result-template.service';

@ApiTags('Donation Result Templates')
@Controller('donation-result-templates')
@UseGuards(ClerkAdminAuthGuard, RolesGuard)
@Roles(AccountRole.STAFF)
export class DonationResultTemplateController {
  constructor(
    private readonly templateService: DonationResultTemplateService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new donation result template',
    description: 'Create a new template for donation results',
  })
  @Roles(AccountRole.STAFF)
  async createTemplate(
    @Req() request: RequestWithUser,
    @Body() createTemplateDto: CreateDonationResultTemplateDto,
  ) {
    return this.templateService.createTemplate(
      request.user.id,
      createTemplateDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all donation result templates with pagination',
  })
  @ApiPaginatedResponse(DonationResultTemplateResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by template name',
  })
  @Roles(AccountRole.STAFF)
  async getTemplates(@Query() query: DonationResultTemplateQueryDto) {
    return this.templateService.getTemplates({
      page: query.page || 1,
      limit: query.limit || 10,
      active: query.active,
      search: query.search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a donation result template by ID' })
  @ApiParam({ name: 'id', type: String })
  @Roles(AccountRole.STAFF)
  async getTemplate(@Param('id') id: string) {
    return this.templateService.getTemplate(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a donation result template',
    description: 'Update an existing template for donation results',
  })
  @ApiParam({ name: 'id', type: String })
  @Roles(AccountRole.STAFF)
  async updateTemplate(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateDonationResultTemplateDto,
  ) {
    return this.templateService.updateTemplate(
      request.user.id,
      id,
      updateTemplateDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a donation result template' })
  @ApiParam({ name: 'id', type: String })
  @Roles(AccountRole.STAFF)
  async deleteTemplate(@Param('id') id: string) {
    await this.templateService.deleteTemplate(id);
    return { success: true };
  }
}
