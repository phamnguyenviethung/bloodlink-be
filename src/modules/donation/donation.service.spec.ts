import { Test, TestingModule } from '@nestjs/testing';
import { DonationService } from './donation.service';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
} from '@/database/entities/campaign.entity';
import { Customer } from '@/database/entities/Account.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock decorator
jest.mock('@mikro-orm/core', () => {
  const originalModule = jest.requireActual('@mikro-orm/core');
  return {
    ...originalModule,
    Transactional:
      () =>
      (target: any, propertyKey: string, descriptor: PropertyDescriptor) =>
        descriptor,
  };
});

describe('DonationService', () => {
  let service: DonationService;

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<DonationService>(DonationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDonationRequest', () => {
    const mockCustomerId = 'customer-id';
    const mockCampaignId = 'campaign-id';
    const mockAppointmentDate = new Date('2023-10-15');
    const mockData = {
      campaignId: mockCampaignId,
      appointmentDate: mockAppointmentDate,
      note: 'Test note',
    };

    const mockCampaign = {
      id: mockCampaignId,
      name: 'Test Campaign',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2030-10-30'), // Future date to pass validation
      status: CampaignStatus.ACTIVE,
    } as Campaign;

    const mockDonor = {
      id: mockCustomerId,
      firstName: 'John',
      lastName: 'Doe',
    } as Customer;

    const mockDonationRequest = {
      id: 'donation-id',
      campaign: mockCampaign,
      donor: mockDonor,
      currentStatus: CampaignDonationStatus.PENDING,
      appointmentDate: mockAppointmentDate,
    } as unknown as CampaignDonation;

    it('should create a donation request successfully', async () => {
      // Arrange
      // Override Date.now to return a fixed date for testing
      const realDateNow = Date.now.bind(global.Date);
      global.Date.now = jest.fn(() => new Date('2023-10-15').getTime());

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockCampaign) // Campaign
        .mockResolvedValueOnce(mockDonor) // Donor
        .mockResolvedValueOnce(null); // No existing donation

      mockEntityManager.create
        .mockReturnValueOnce(mockDonationRequest) // Donation request
        .mockReturnValueOnce({}); // Log

      // Act
      const result = await service.createDonationRequest(
        mockCustomerId,
        mockData,
      );

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(3);
      expect(mockEntityManager.create).toHaveBeenCalledTimes(2);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockDonationRequest);
      expect(mockEntityManager.create).toHaveBeenCalledWith(CampaignDonation, {
        campaign: mockCampaign,
        donor: mockDonor,
        currentStatus: CampaignDonationStatus.PENDING,
        appointmentDate: mockAppointmentDate,
      });

      // Restore Date.now
      global.Date.now = realDateNow;
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null); // Campaign not found

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(NotFoundException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when campaign has not started yet', async () => {
      // Arrange
      const realDateNow = Date.now.bind(global.Date);
      global.Date.now = jest.fn(() => new Date('2023-09-01').getTime()); // Before start date

      const futureCampaign = {
        ...mockCampaign,
        startDate: new Date('2023-10-01'),
      } as Campaign;

      mockEntityManager.findOne.mockResolvedValueOnce(futureCampaign);

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();

      // Restore Date.now
      global.Date.now = realDateNow;
    });

    it('should throw BadRequestException when campaign has already ended', async () => {
      // Arrange
      const realDateNow = Date.now.bind(global.Date);
      global.Date.now = jest.fn(() => new Date('2023-11-01').getTime()); // After end date

      const pastCampaign = {
        ...mockCampaign,
        endDate: new Date('2023-10-31'),
      } as Campaign;

      mockEntityManager.findOne.mockResolvedValueOnce(pastCampaign);

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();

      // Restore Date.now
      global.Date.now = realDateNow;
    });

    it('should throw BadRequestException when campaign is not active', async () => {
      // Arrange
      const inactiveCampaign = {
        ...mockCampaign,
        status: CampaignStatus.NOT_STARTED,
      } as Campaign;

      mockEntityManager.findOne.mockResolvedValueOnce(inactiveCampaign);

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when donor does not exist', async () => {
      // Arrange
      const realDateNow = Date.now.bind(global.Date);
      global.Date.now = jest.fn(() => new Date('2023-10-15').getTime());

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockCampaign) // Campaign
        .mockResolvedValueOnce(null); // Donor not found

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(NotFoundException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(2);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();

      // Restore Date.now
      global.Date.now = realDateNow;
    });

    it('should throw BadRequestException when donor has already donated to this campaign', async () => {
      // Arrange
      const realDateNow = Date.now.bind(global.Date);
      global.Date.now = jest.fn(() => new Date('2023-10-15').getTime());

      mockEntityManager.findOne
        .mockResolvedValueOnce(mockCampaign) // Campaign
        .mockResolvedValueOnce(mockDonor) // Donor
        .mockResolvedValueOnce({}); // Existing donation

      // Act & Assert
      await expect(
        service.createDonationRequest(mockCustomerId, mockData),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(3);
      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();

      // Restore Date.now
      global.Date.now = realDateNow;
    });
  });

  describe('getDonationRequestById', () => {
    const mockDonationRequestId = 'donation-id';
    const mockCustomerId = 'customer-id';

    const mockDonationRequest = {
      id: mockDonationRequestId,
      donor: { id: mockCustomerId },
      campaign: { id: 'campaign-id' },
      currentStatus: CampaignDonationStatus.PENDING,
    } as unknown as CampaignDonation;

    const mockLogs = [
      { status: CampaignDonationStatus.PENDING, note: 'Created' },
    ];

    it('should return a donation request with logs when found', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockDonationRequest);
      mockEntityManager.find.mockResolvedValueOnce(mockLogs);

      // Act
      const result = await service.getDonationRequestById(
        mockDonationRequestId,
      );

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ...mockDonationRequest,
        logs: mockLogs,
      });
    });

    it('should throw NotFoundException when donation request is not found', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.getDonationRequestById(mockDonationRequestId),
      ).rejects.toThrow(NotFoundException);

      expect(mockEntityManager.findOne).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.find).not.toHaveBeenCalled();
    });

    it('should use customerId as additional filter when provided', async () => {
      // Arrange
      mockEntityManager.findOne.mockResolvedValueOnce(mockDonationRequest);
      mockEntityManager.find.mockResolvedValueOnce(mockLogs);

      // Act
      await service.getDonationRequestById(
        mockDonationRequestId,
        mockCustomerId,
      );

      // Assert
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        CampaignDonation,
        { id: mockDonationRequestId, donor: { id: mockCustomerId } },
        { populate: ['donor', 'campaign'] },
      );
    });
  });

  describe('getDonationRequests', () => {
    const mockQuery = {
      page: 1,
      limit: 10,
      status: CampaignDonationStatus.PENDING,
    };
    const mockCustomerId = 'customer-id';

    const mockDonations = [
      { id: 'donation-1', currentStatus: CampaignDonationStatus.PENDING },
      { id: 'donation-2', currentStatus: CampaignDonationStatus.PENDING },
    ];

    it('should return paginated donation requests', async () => {
      // Arrange
      mockEntityManager.findAndCount.mockResolvedValueOnce([mockDonations, 2]);

      // Act
      const result = await service.getDonationRequests(mockQuery);

      // Assert
      expect(mockEntityManager.findAndCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        items: mockDonations,
        total: 2,
      });
    });

    it('should use customerId as additional filter when provided', async () => {
      // Arrange
      mockEntityManager.findAndCount.mockResolvedValueOnce([mockDonations, 2]);

      // Act
      await service.getDonationRequests(mockQuery, mockCustomerId);

      // Assert
      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        CampaignDonation,
        {
          donor: { id: mockCustomerId },
          currentStatus: CampaignDonationStatus.PENDING,
        },
        {
          populate: ['donor', 'campaign'],
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'DESC' },
        },
      );
    });
  });

  describe('cancelDonationRequest', () => {
    const mockDonationRequestId = 'donation-id';
    const mockCustomerId = 'customer-id';

    const mockDonationRequest = {
      id: mockDonationRequestId,
      donor: { id: mockCustomerId },
      campaign: { id: 'campaign-id' },
      currentStatus: CampaignDonationStatus.PENDING,
    } as unknown as CampaignDonation;

    const mockLog = {
      campaignDonation: mockDonationRequest,
      status: CampaignDonationStatus.FAILED,
      note: 'Donation request cancelled by donor',
    };

    it('should cancel a pending donation request', async () => {
      // Arrange
      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(mockDonationRequest);
      mockEntityManager.create.mockReturnValueOnce(mockLog);

      // Act
      const result = await service.cancelDonationRequest(
        mockDonationRequestId,
        mockCustomerId,
      );

      // Assert
      expect(service.getDonationRequestById).toHaveBeenCalledWith(
        mockDonationRequestId,
        mockCustomerId,
      );
      expect(mockDonationRequest.currentStatus).toBe(
        CampaignDonationStatus.FAILED,
      );
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        CampaignDonationLog,
        {
          campaignDonation: mockDonationRequest,
          status: CampaignDonationStatus.FAILED,
          note: 'Donation request cancelled by donor',
        },
      );
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith([
        mockDonationRequest,
        mockLog,
      ]);
      expect(result).toEqual(mockDonationRequest);
    });

    it('should throw BadRequestException when trying to cancel a non-pending request', async () => {
      // Arrange
      const completedRequest = {
        ...mockDonationRequest,
        currentStatus: CampaignDonationStatus.COMPLETED,
      } as unknown as CampaignDonation;

      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(completedRequest);

      // Act & Assert
      await expect(
        service.cancelDonationRequest(mockDonationRequestId, mockCustomerId),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('updateDonationRequestStatus', () => {
    const mockDonationRequestId = 'donation-id';
    const mockStaffId = 'staff-id';
    const mockAppointmentDate = new Date('2023-10-20');

    const mockData = {
      status: CampaignDonationStatus.COMPLETED,
      appointmentDate: mockAppointmentDate,
      note: 'Status updated by staff',
    };

    const mockDonationRequest = {
      id: mockDonationRequestId,
      currentStatus: CampaignDonationStatus.PENDING,
      appointmentDate: null,
    } as unknown as CampaignDonation;

    const mockLog = {
      campaignDonation: mockDonationRequest,
      status: CampaignDonationStatus.COMPLETED,
      note: 'Status updated by staff',
      staff: { id: 'staff-id' },
    };

    it('should update donation request status and appointment date', async () => {
      // Arrange
      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(mockDonationRequest);
      mockEntityManager.create.mockReturnValueOnce(mockLog);

      // Act
      const result = await service.updateDonationRequestStatus(
        mockDonationRequestId,
        mockStaffId,
        mockData,
      );

      // Assert
      expect(service.getDonationRequestById).toHaveBeenCalledWith(
        mockDonationRequestId,
      );
      expect(mockDonationRequest.currentStatus).toBe(
        CampaignDonationStatus.COMPLETED,
      );
      expect(mockDonationRequest.appointmentDate).toEqual(mockAppointmentDate);
      expect(mockEntityManager.create).toHaveBeenCalledWith(
        CampaignDonationLog,
        {
          campaignDonation: mockDonationRequest,
          status: CampaignDonationStatus.COMPLETED,
          note: 'Status updated by staff',
          staff: { id: mockStaffId },
        },
      );
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith([
        mockDonationRequest,
        mockLog,
      ]);
      expect(result).toEqual(mockDonationRequest);
    });

    it('should throw BadRequestException when current status is the same as new status', async () => {
      // Arrange
      const completedRequest = {
        ...mockDonationRequest,
        currentStatus: CampaignDonationStatus.COMPLETED,
      } as unknown as CampaignDonation;

      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(completedRequest);

      // Act & Assert
      await expect(
        service.updateDonationRequestStatus(
          mockDonationRequestId,
          mockStaffId,
          mockData,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to update a failed request', async () => {
      // Arrange
      const failedRequest = {
        ...mockDonationRequest,
        currentStatus: CampaignDonationStatus.FAILED,
      } as unknown as CampaignDonation;

      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(failedRequest);

      // Act & Assert
      await expect(
        service.updateDonationRequestStatus(
          mockDonationRequestId,
          mockStaffId,
          mockData,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to update a completed request', async () => {
      // Arrange
      const completedRequest = {
        ...mockDonationRequest,
        currentStatus: CampaignDonationStatus.COMPLETED,
      } as unknown as CampaignDonation;

      jest
        .spyOn(service, 'getDonationRequestById')
        .mockResolvedValueOnce(completedRequest);

      // Act & Assert
      await expect(
        service.updateDonationRequestStatus(
          mockDonationRequestId,
          mockStaffId,
          { status: CampaignDonationStatus.FAILED, note: 'test' },
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.create).not.toHaveBeenCalled();
      expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
    });
  });
});
