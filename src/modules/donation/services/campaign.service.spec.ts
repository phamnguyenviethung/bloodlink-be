import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { EntityManager } from '@mikro-orm/core';
import { Campaign, CampaignStatus } from '@/database/entities/campaign.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCampaignDtoType, UpdateCampaignDtoType } from '../dtos';

describe('CampaignService', () => {
  let service: CampaignService;

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    persistAndFlush: jest.fn(),
    flush: jest.fn(),
    removeAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCampaign', () => {
    const mockCampaignData: CreateCampaignDtoType = {
      name: 'Test Campaign',
      description: 'Test Description',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-31'),
      status: CampaignStatus.NOT_STARTED,
      banner: 'banner-url',
    };

    it('should create a campaign successfully', async () => {
      // Arrange
      jest
        .spyOn(mockEntityManager, 'persistAndFlush')
        .mockResolvedValueOnce(undefined);

      // Act
      const result = await service.createCampaign(mockCampaignData);

      // Assert
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Campaign);
      expect(result.name).toBe(mockCampaignData.name);
      expect(result.description).toBe(mockCampaignData.description);
      expect(result.status).toBe(mockCampaignData.status);
      expect(result.banner).toBe(mockCampaignData.banner);
    });

    it('should convert string dates to Date objects', async () => {
      // Arrange
      const stringDateData = {
        ...mockCampaignData,
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      };

      jest
        .spyOn(mockEntityManager, 'persistAndFlush')
        .mockResolvedValueOnce(undefined);

      // Act
      const result = await service.createCampaign(stringDateData);

      // Assert
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException when end date is before start date', async () => {
      // Arrange
      const invalidDateData = {
        ...mockCampaignData,
        startDate: new Date('2023-10-31'),
        endDate: new Date('2023-10-01'),
      };

      // Act & Assert
      await expect(service.createCampaign(invalidDateData)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('updateCampaign', () => {
    const campaignId = 'campaign-id';
    const mockCampaign = {
      id: campaignId,
      name: 'Test Campaign',
      description: 'Test Description',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-31'),
      status: CampaignStatus.NOT_STARTED,
      banner: 'banner-url',
    } as Campaign;

    const updateData: UpdateCampaignDtoType = {
      name: 'Updated Campaign',
      status: CampaignStatus.ACTIVE,
    };

    it('should update a campaign successfully', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockCampaign);
      mockEntityManager.flush.mockResolvedValueOnce(undefined);

      // Act
      const result = await service.updateCampaign(campaignId, updateData);

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Campaign, {
        id: campaignId,
      });
      expect(mockEntityManager.flush).toHaveBeenCalledTimes(1);
      expect(result.name).toBe(updateData.name);
      expect(result.status).toBe(updateData.status);
      expect(result.description).toBe(mockCampaign.description); // Unchanged
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.updateCampaign(campaignId, updateData),
      ).rejects.toThrow(NotFoundException);

      expect(mockEntityManager.flush).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updated dates are invalid', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockCampaign);

      const invalidUpdateData: UpdateCampaignDtoType = {
        startDate: new Date('2023-10-31'),
        endDate: new Date('2023-10-01'),
      };

      // Act & Assert
      await expect(
        service.updateCampaign(campaignId, invalidUpdateData),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.flush).not.toHaveBeenCalled();
    });
  });

  describe('getCampaign', () => {
    const campaignId = 'campaign-id';
    const mockCampaign = {
      id: campaignId,
      name: 'Test Campaign',
    } as Campaign;

    it('should return a campaign when found', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockCampaign);

      // Act
      const result = await service.getCampaign(campaignId);

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Campaign, {
        id: campaignId,
      });
      expect(result).toBe(mockCampaign);
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.getCampaign(campaignId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteCampaign', () => {
    const campaignId = 'campaign-id';
    const mockCampaign = {
      id: campaignId,
      name: 'Test Campaign',
    } as Campaign;

    it('should delete a campaign when found', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockCampaign);
      mockEntityManager.removeAndFlush.mockResolvedValueOnce(undefined);

      // Act
      await service.deleteCampaign(campaignId);

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Campaign, {
        id: campaignId,
      });
      expect(mockEntityManager.removeAndFlush).toHaveBeenCalledWith(
        mockCampaign,
      );
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.deleteCampaign(campaignId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockEntityManager.removeAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('getCampaigns', () => {
    const mockCampaigns = [
      { id: 'campaign-1', name: 'Campaign 1' },
      { id: 'campaign-2', name: 'Campaign 2' },
    ] as Campaign[];

    it('should return paginated campaigns', async () => {
      // Arrange
      mockEntityManager.findAndCount.mockResolvedValueOnce([mockCampaigns, 2]);

      const options = {
        page: 1,
        limit: 10,
      };

      // Act
      const result = await service.getCampaigns(options);

      // Assert
      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        Campaign,
        {},
        {
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'DESC' },
        },
      );

      expect(result).toEqual({
        data: mockCampaigns,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should apply status filter when provided', async () => {
      // Arrange
      mockEntityManager.findAndCount.mockResolvedValueOnce([mockCampaigns, 2]);

      const options = {
        page: 1,
        limit: 10,
        status: CampaignStatus.ACTIVE,
      };

      // Act
      await service.getCampaigns(options);

      // Assert
      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        Campaign,
        { status: CampaignStatus.ACTIVE },
        expect.any(Object),
      );
    });

    it('should apply search filter when provided', async () => {
      // Arrange
      mockEntityManager.findAndCount.mockResolvedValueOnce([mockCampaigns, 2]);

      const options = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      // Act
      await service.getCampaigns(options);

      // Assert
      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        Campaign,
        {
          $or: [
            { name: { $ilike: '%test%' } },
            { description: { $ilike: '%test%' } },
          ],
        },
        expect.any(Object),
      );
    });
  });
});
