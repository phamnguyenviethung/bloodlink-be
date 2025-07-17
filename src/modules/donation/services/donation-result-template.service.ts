import {
  DonationResultTemplate,
  DonationResultTemplateItem,
  DonationResultTemplateItemOption,
  DonationResultTemplateItemType,
} from '@/database/entities/campaign.entity';
import {
  createPaginatedResponse,
  PaginatedResponseType,
} from '@/share/dtos/pagination.dto';
import { EntityManager, Transactional } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDonationResultTemplateDtoType,
  TemplateItemDtoType,
  TemplateItemOptionDtoType,
  UpdateDonationResultTemplateDtoType,
} from '../dtos/donation-result-template.dto';
import { IDonationResultTemplateService } from '../interfaces/donation-result-template.interface';
import { Staff } from '@/database/entities/Account.entity';

@Injectable()
export class DonationResultTemplateService
  implements IDonationResultTemplateService
{
  private readonly logger = new Logger(DonationResultTemplateService.name);

  constructor(private readonly em: EntityManager) {}

  @Transactional()
  async createTemplate(
    staffId: string,
    data: CreateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Create template
      const template = new DonationResultTemplate();
      template.name = data.name;
      template.description = data.description || '';
      template.active = data.active !== undefined ? data.active : true;
      template.createdBy = staff;
      template.updatedBy = staff;

      await this.em.persistAndFlush(template);

      // Create items
      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          // Validate item data
          await this.validateItemData(itemData);

          const item = new DonationResultTemplateItem();
          item.template = template;
          item.type = itemData.type;
          item.label = itemData.label;
          item.description = itemData.description || '';
          item.placeholder = itemData.placeholder || '';
          item.defaultValue = itemData.defaultValue || '';
          item.sortOrder = itemData.sortOrder;
          item.minValue = itemData.minValue;
          item.maxValue = itemData.maxValue;
          item.minLength = itemData.minLength;
          item.maxLength = itemData.maxLength;
          item.isRequired =
            itemData.isRequired !== undefined ? itemData.isRequired : true;
          item.pattern = itemData.pattern || '';

          await this.em.persist(item);

          // Create options if applicable
          if (itemData.options && itemData.options.length > 0) {
            for (const optionData of itemData.options) {
              const option = new DonationResultTemplateItemOption();
              option.item = item;
              option.label = optionData.label;
              await this.em.persist(option);
            }
          }
        }
      }

      await this.em.flush();
      return template;
    } catch (error: any) {
      this.logger.error(
        `Error creating template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Transactional()
  async updateTemplate(
    staffId: string,
    id: string,
    data: UpdateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find template
      const template = await this.em.findOne(
        DonationResultTemplate,
        { id },
        {
          populate: ['items.options', 'items'],
        },
      );
      if (!template) {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }

      // Update template fields
      if (data.name !== undefined) template.name = data.name;
      if (data.description !== undefined)
        template.description = data.description;
      if (data.active !== undefined) template.active = data.active;
      template.updatedBy = staff;

      // Update items if provided
      if (data.items) {
        // Remove existing items and their options
        const existingItems = await this.em.find(DonationResultTemplateItem, {
          template,
        });
        for (const item of existingItems) {
          // Remove options
          const options = await this.em.find(DonationResultTemplateItemOption, {
            item,
          });
          await this.em.removeAndFlush(options);
        }
        await this.em.removeAndFlush(existingItems);

        // Create new items
        for (const itemData of data.items) {
          // Validate item data
          await this.validateItemData(itemData);

          const item = new DonationResultTemplateItem();
          item.template = template;
          item.type = itemData.type;
          item.label = itemData.label;
          item.description = itemData.description || '';
          item.placeholder = itemData.placeholder || '';
          item.defaultValue = itemData.defaultValue || '';
          item.sortOrder = itemData.sortOrder;
          item.minValue = itemData.minValue;
          item.maxValue = itemData.maxValue;
          item.minLength = itemData.minLength;
          item.maxLength = itemData.maxLength;
          item.isRequired =
            itemData.isRequired !== undefined ? itemData.isRequired : true;
          item.pattern = itemData.pattern || '';

          await this.em.persist(item);

          // Create options if applicable
          if (itemData.options && itemData.options.length > 0) {
            for (const optionData of itemData.options) {
              const option = new DonationResultTemplateItemOption();
              option.item = item;
              option.label = optionData.label;
              await this.em.persist(option);
            }
          }
        }
      }

      await this.em.flush();
      return template;
    } catch (error: any) {
      this.logger.error(
        `Error updating template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTemplate(id: string): Promise<DonationResultTemplate> {
    const template = await this.em.findOne(
      DonationResultTemplate,
      { id },
      {
        populate: ['items.options', 'items', 'createdBy', 'updatedBy'],
      },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  @Transactional()
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.em.findOne(
      DonationResultTemplate,
      { id },
      {
        populate: ['items.options', 'items'],
      },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    // Delete all related items and options
    const items = await this.em.find(DonationResultTemplateItem, { template });
    for (const item of items) {
      // Delete options
      const options = await this.em.find(DonationResultTemplateItemOption, {
        item,
      });
      await this.em.removeAndFlush(options);
    }
    await this.em.removeAndFlush(items);

    // Delete template
    await this.em.removeAndFlush(template);
  }

  async getTemplates(options: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }): Promise<PaginatedResponseType<DonationResultTemplate>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryOptions: Record<string, any> = {};
    if (options.active !== undefined) {
      queryOptions.active = options.active;
    }

    const [templates, total] = await this.em.findAndCount(
      DonationResultTemplate,
      options.search
        ? {
            ...queryOptions,
            name: { $ilike: `%${options.search}%` },
          }
        : queryOptions,
      {
        populate: ['createdBy', 'updatedBy'],
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return createPaginatedResponse(templates, page, limit, total);
  }

  // Item methods
  @Transactional()
  async addItemToTemplate(
    staffId: string,
    templateId: string,
    itemData: TemplateItemDtoType,
  ): Promise<DonationResultTemplateItem> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find template
      const template = await this.em.findOne(DonationResultTemplate, {
        id: templateId,
      });
      if (!template) {
        throw new NotFoundException(`Template with ID ${templateId} not found`);
      }

      // Update template's updatedBy
      template.updatedBy = staff;
      await this.em.flush();

      // Validate item data
      await this.validateItemData(itemData);

      // Create item
      const item = new DonationResultTemplateItem();
      item.template = template;
      item.type = itemData.type;
      item.label = itemData.label;
      item.description = itemData.description || '';
      item.placeholder = itemData.placeholder || '';
      item.defaultValue = itemData.defaultValue || '';
      item.sortOrder = itemData.sortOrder;
      item.minValue = itemData.minValue;
      item.maxValue = itemData.maxValue;
      item.minLength = itemData.minLength;
      item.maxLength = itemData.maxLength;
      item.isRequired =
        itemData.isRequired !== undefined ? itemData.isRequired : true;
      item.pattern = itemData.pattern || '';

      await this.em.persistAndFlush(item);

      // Create options if applicable
      if (itemData.options && itemData.options.length > 0) {
        for (const optionData of itemData.options) {
          const option = new DonationResultTemplateItemOption();
          option.item = item;
          option.label = optionData.label;
          await this.em.persist(option);
        }
        await this.em.flush();
      }

      return item;
    } catch (error: any) {
      this.logger.error(
        `Error adding item to template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Transactional()
  async updateItem(
    staffId: string,
    itemId: string,
    itemData: TemplateItemDtoType,
  ): Promise<DonationResultTemplateItem> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find item
      const item = await this.em.findOne(
        DonationResultTemplateItem,
        { id: itemId },
        { populate: ['template', 'options'] },
      );
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      // Update template's updatedBy
      item.template.updatedBy = staff;

      // Validate item data
      await this.validateItemData(itemData);

      // Update item fields
      if (itemData.type !== undefined) item.type = itemData.type;
      if (itemData.label !== undefined) item.label = itemData.label;
      if (itemData.description !== undefined)
        item.description = itemData.description;
      if (itemData.placeholder !== undefined)
        item.placeholder = itemData.placeholder;
      if (itemData.defaultValue !== undefined)
        item.defaultValue = itemData.defaultValue;
      if (itemData.sortOrder !== undefined) item.sortOrder = itemData.sortOrder;
      if (itemData.minValue !== undefined) item.minValue = itemData.minValue;
      if (itemData.maxValue !== undefined) item.maxValue = itemData.maxValue;
      if (itemData.minLength !== undefined) item.minLength = itemData.minLength;
      if (itemData.maxLength !== undefined) item.maxLength = itemData.maxLength;
      if (itemData.isRequired !== undefined)
        item.isRequired = itemData.isRequired;
      if (itemData.pattern !== undefined) item.pattern = itemData.pattern;

      // Update options if provided
      if (itemData.options !== undefined) {
        // Remove existing options
        const existingOptions = await this.em.find(
          DonationResultTemplateItemOption,
          { item },
        );
        await this.em.removeAndFlush(existingOptions);

        // Create new options
        if (itemData.options && itemData.options.length > 0) {
          for (const optionData of itemData.options) {
            const option = new DonationResultTemplateItemOption();
            option.item = item;
            option.label = optionData.label;
            await this.em.persist(option);
          }
        }
      }

      await this.em.flush();
      return item;
    } catch (error: any) {
      this.logger.error(`Error updating item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getItem(itemId: string): Promise<DonationResultTemplateItem> {
    const item = await this.em.findOne(
      DonationResultTemplateItem,
      { id: itemId },
      { populate: ['template', 'options'] },
    );

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    return item;
  }

  @Transactional()
  async deleteItem(staffId: string, itemId: string): Promise<void> {
    // Find staff
    const staff = await this.em.findOne(Staff, { id: staffId });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${staffId} not found`);
    }

    // Find item
    const item = await this.em.findOne(
      DonationResultTemplateItem,
      { id: itemId },
      { populate: ['template', 'options'] },
    );
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Update template's updatedBy
    item.template.updatedBy = staff;
    await this.em.flush();

    // Delete options
    const options = await this.em.find(DonationResultTemplateItemOption, {
      item,
    });
    await this.em.removeAndFlush(options);

    // Delete item
    await this.em.removeAndFlush(item);
  }

  async getItemsByTemplate(
    templateId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponseType<DonationResultTemplateItem>> {
    // Find template
    const template = await this.em.findOne(DonationResultTemplate, {
      id: templateId,
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const [items, total] = await this.em.findAndCount(
      DonationResultTemplateItem,
      { template },
      {
        populate: ['options'],
        limit,
        offset: (page - 1) * limit,
        orderBy: { sortOrder: 'ASC' },
      },
    );

    return createPaginatedResponse(items, page, limit, total);
  }

  // Option methods
  @Transactional()
  async addOptionToItem(
    staffId: string,
    itemId: string,
    optionData: TemplateItemOptionDtoType,
  ): Promise<DonationResultTemplateItemOption> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find item
      const item = await this.em.findOne(
        DonationResultTemplateItem,
        { id: itemId },
        { populate: ['template'] },
      );
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      // Check if item type supports options
      if (
        item.type !== DonationResultTemplateItemType.SELECT &&
        item.type !== DonationResultTemplateItemType.RADIO
      ) {
        throw new BadRequestException(
          `Cannot add options to item with type ${item.type}. Options are only supported for SELECT and RADIO types.`,
        );
      }

      // Update template's updatedBy
      item.template.updatedBy = staff;
      await this.em.flush();

      // Create option
      const option = new DonationResultTemplateItemOption();
      option.item = item;
      option.label = optionData.label;

      await this.em.persistAndFlush(option);
      return option;
    } catch (error: any) {
      this.logger.error(
        `Error adding option to item: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Transactional()
  async updateOption(
    staffId: string,
    optionId: string,
    optionData: TemplateItemOptionDtoType,
  ): Promise<DonationResultTemplateItemOption> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find option
      const option = await this.em.findOne(
        DonationResultTemplateItemOption,
        { id: optionId },
        { populate: ['item', 'item.template'] },
      );
      if (!option) {
        throw new NotFoundException(`Option with ID ${optionId} not found`);
      }

      // Update template's updatedBy
      option.item.template.updatedBy = staff;

      // Update option
      if (optionData.label !== undefined) option.label = optionData.label;

      await this.em.flush();
      return option;
    } catch (error: any) {
      this.logger.error(`Error updating option: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getOption(optionId: string): Promise<DonationResultTemplateItemOption> {
    const option = await this.em.findOne(
      DonationResultTemplateItemOption,
      { id: optionId },
      { populate: ['item'] },
    );

    if (!option) {
      throw new NotFoundException(`Option with ID ${optionId} not found`);
    }

    return option;
  }

  @Transactional()
  async deleteOption(staffId: string, optionId: string): Promise<void> {
    // Find staff
    const staff = await this.em.findOne(Staff, { id: staffId });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${staffId} not found`);
    }

    // Find option
    const option = await this.em.findOne(
      DonationResultTemplateItemOption,
      { id: optionId },
      { populate: ['item', 'item.template', 'item.options'] },
    );
    if (!option) {
      throw new NotFoundException(`Option with ID ${optionId} not found`);
    }

    // Check if this is the last option for a SELECT or RADIO item
    if (
      (option.item.type === DonationResultTemplateItemType.SELECT ||
        option.item.type === DonationResultTemplateItemType.RADIO) &&
      option.item.options.length <= 1
    ) {
      throw new BadRequestException(
        `Cannot delete the last option for a ${option.item.type} item. SELECT and RADIO items must have at least one option.`,
      );
    }

    // Update template's updatedBy
    option.item.template.updatedBy = staff;
    await this.em.flush();

    // Delete option
    await this.em.removeAndFlush(option);
  }

  async getOptionsByItem(
    itemId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponseType<DonationResultTemplateItemOption>> {
    // Find item
    const item = await this.em.findOne(DonationResultTemplateItem, {
      id: itemId,
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const [itemOptions, total] = await this.em.findAndCount(
      DonationResultTemplateItemOption,
      { item },
      {
        limit,
        offset: (page - 1) * limit,
      },
    );

    return createPaginatedResponse(itemOptions, page, limit, total);
  }

  // Validation methods
  private async validateItemData(itemData: TemplateItemDtoType): Promise<void> {
    // Validate that SELECT and RADIO types have options
    if (
      (itemData.type === DonationResultTemplateItemType.SELECT ||
        itemData.type === DonationResultTemplateItemType.RADIO) &&
      (!itemData.options || itemData.options.length === 0)
    ) {
      throw new BadRequestException(
        `${itemData.type} fields must have at least one option`,
      );
    }

    // Validate that NUMBER type has valid min/max values if both are provided
    if (
      itemData.type === DonationResultTemplateItemType.NUMBER &&
      itemData.minValue !== undefined &&
      itemData.maxValue !== undefined &&
      itemData.minValue > itemData.maxValue
    ) {
      throw new BadRequestException(
        `minValue (${itemData.minValue}) must be less than or equal to maxValue (${itemData.maxValue})`,
      );
    }

    // Validate that TEXT and TEXTAREA types have valid minLength/maxLength if both are provided
    if (
      (itemData.type === DonationResultTemplateItemType.TEXT ||
        itemData.type === DonationResultTemplateItemType.TEXTAREA) &&
      itemData.minLength !== undefined &&
      itemData.maxLength !== undefined &&
      itemData.minLength > itemData.maxLength
    ) {
      throw new BadRequestException(
        `minLength (${itemData.minLength}) must be less than or equal to maxLength (${itemData.maxLength})`,
      );
    }
  }
}
