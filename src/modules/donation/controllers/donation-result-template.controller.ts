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
  CreateTemplateItemDto,
  CreateTemplateItemOptionDto,
  DonationResultTemplateQueryDto,
  DonationResultTemplateResponseDto,
  TemplateItemOptionResponseDto,
  TemplateItemResponseDto,
  UpdateDonationResultTemplateDto,
  UpdateTemplateItemDto,
  UpdateTemplateItemOptionDto,
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

  @Post(':id/items')
  @ApiOperation({
    summary: 'Add an item to a template',
    description: 'Add a new item to an existing template',
  })
  @ApiParam({ name: 'id', type: String, description: 'Template ID' })
  @Roles(AccountRole.STAFF)
  async addItemToTemplate(
    @Req() request: RequestWithUser,
    @Param('id') templateId: string,
    @Body() createItemDto: CreateTemplateItemDto,
  ) {
    return this.templateService.addItemToTemplate(
      request.user.id,
      templateId,
      createItemDto,
    );
  }

  @Get(':id/items')
  @ApiOperation({
    summary: 'Get all items for a template',
    description: 'Get all items for a specific template with pagination',
  })
  @ApiPaginatedResponse(TemplateItemResponseDto)
  @ApiParam({ name: 'id', type: String, description: 'Template ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(AccountRole.STAFF)
  async getItemsByTemplate(
    @Param('id') templateId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.templateService.getItemsByTemplate(templateId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('items/:itemId')
  @ApiOperation({
    summary: 'Get an item by ID',
    description: 'Get details of a specific template item',
  })
  @ApiParam({ name: 'itemId', type: String, description: 'Item ID' })
  @Roles(AccountRole.STAFF)
  async getItem(@Param('itemId') itemId: string) {
    return this.templateService.getItem(itemId);
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'Update an item',
    description: 'Update an existing template item',
  })
  @ApiParam({ name: 'itemId', type: String, description: 'Item ID' })
  @Roles(AccountRole.STAFF)
  async updateItem(
    @Req() request: RequestWithUser,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateTemplateItemDto,
  ) {
    return this.templateService.updateItem(
      request.user.id,
      itemId,
      updateItemDto,
    );
  }

  @Delete('items/:itemId')
  @ApiOperation({
    summary: 'Delete an item',
    description: 'Delete an existing template item and its options',
  })
  @ApiParam({ name: 'itemId', type: String, description: 'Item ID' })
  @Roles(AccountRole.STAFF)
  async deleteItem(
    @Req() request: RequestWithUser,
    @Param('itemId') itemId: string,
  ) {
    await this.templateService.deleteItem(request.user.id, itemId);
    return { success: true };
  }

  @Post('items/:itemId/options')
  @ApiOperation({
    summary: 'Add an option to an item',
    description:
      'Add a new option to an existing template item (for SELECT and RADIO types)',
  })
  @ApiParam({ name: 'itemId', type: String, description: 'Item ID' })
  @Roles(AccountRole.STAFF)
  async addOptionToItem(
    @Req() request: RequestWithUser,
    @Param('itemId') itemId: string,
    @Body() createOptionDto: CreateTemplateItemOptionDto,
  ) {
    return this.templateService.addOptionToItem(
      request.user.id,
      itemId,
      createOptionDto,
    );
  }

  @Get('items/:itemId/options')
  @ApiOperation({
    summary: 'Get all options for an item',
    description: 'Get all options for a specific template item with pagination',
  })
  @ApiPaginatedResponse(TemplateItemOptionResponseDto)
  @ApiParam({ name: 'itemId', type: String, description: 'Item ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(AccountRole.STAFF)
  async getOptionsByItem(
    @Param('itemId') itemId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.templateService.getOptionsByItem(itemId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('options/:optionId')
  @ApiOperation({
    summary: 'Get an option by ID',
    description: 'Get details of a specific template item option',
  })
  @ApiParam({ name: 'optionId', type: String, description: 'Option ID' })
  @Roles(AccountRole.STAFF)
  async getOption(@Param('optionId') optionId: string) {
    return this.templateService.getOption(optionId);
  }

  @Patch('options/:optionId')
  @ApiOperation({
    summary: 'Update an option',
    description: 'Update an existing template item option',
  })
  @ApiParam({ name: 'optionId', type: String, description: 'Option ID' })
  @Roles(AccountRole.STAFF)
  async updateOption(
    @Req() request: RequestWithUser,
    @Param('optionId') optionId: string,
    @Body() updateOptionDto: UpdateTemplateItemOptionDto,
  ) {
    return this.templateService.updateOption(
      request.user.id,
      optionId,
      updateOptionDto,
    );
  }

  @Delete('options/:optionId')
  @ApiOperation({
    summary: 'Delete an option',
    description: 'Delete an existing template item option',
  })
  @ApiParam({ name: 'optionId', type: String, description: 'Option ID' })
  @Roles(AccountRole.STAFF)
  async deleteOption(
    @Req() request: RequestWithUser,
    @Param('optionId') optionId: string,
  ) {
    await this.templateService.deleteOption(request.user.id, optionId);
    return { success: true };
  }

  @Get(':id/validate-usage')
  @ApiOperation({
    summary: 'Validate template usage',
    description: 'Check if a template is currently in use',
  })
  @ApiParam({ name: 'id', type: String, description: 'Template ID' })
  @Roles(AccountRole.STAFF)
  async validateTemplateUsage(@Param('id') id: string) {
    const isInUse = await this.templateService.validateTemplateUsage(id);
    return { isInUse };
  }
}
