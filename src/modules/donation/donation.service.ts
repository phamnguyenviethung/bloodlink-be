import { Customer, Staff } from '@/database/entities/Account.entity';
import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
  DonationResult,
} from '@/database/entities/campaign.entity';
import { Transactional } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDonationRequestDtoType,
  DonationRequestListQueryDtoType,
  UpdateDonationRequestStatusDtoType,
} from './dtos/donation-request.dto';
import { UpdateDonationResultDtoType } from './dtos/donation-result.dto';

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(private readonly em: EntityManager) {}

  @Transactional()
  async createDonationRequest(
    customerId: string,
    data: CreateDonationRequestDtoType,
  ): Promise<CampaignDonation> {
    const { campaignId, note, appointmentDate } = data;

    // Validate campaign exists and is active
    const campaign = await this.em.findOne(Campaign, { id: campaignId });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    // Check campaign time period
    const now = new Date();
    if (now < campaign.startDate) {
      throw new BadRequestException(
        `Campaign has not started yet. Starts on ${campaign.startDate}`,
      );
    }
    if (now > campaign.endDate) {
      throw new BadRequestException(
        `Campaign has already ended on ${campaign.endDate}`,
      );
    }

    // Check campaign status
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException(
        `Campaign is not active. Current status: ${campaign.status}`,
      );
    }

    // Validate donor
    const donor = await this.em.findOne(Customer, { id: customerId });
    if (!donor) {
      throw new NotFoundException(`Donor with ID ${customerId} not found`);
    }

    // Check if donor has already donated to this campaign
    const existingDonation = await this.em.findOne(CampaignDonation, {
      campaign: { id: campaignId },
      donor: { id: customerId },
    });

    if (existingDonation) {
      throw new BadRequestException(
        `You have already created a donation request for this campaign`,
      );
    }

    // Validate appointment date against bloodCollectionDate if both exist
    let appointmentDateTime: Date | undefined = undefined;
    if (appointmentDate) {
      appointmentDateTime = new Date(appointmentDate);

      // If campaign has a bloodCollectionDate, appointment must be on the same day
      if (campaign.bloodCollectionDate) {
        const bloodCollectionDate = new Date(campaign.bloodCollectionDate);

        // Compare only year, month, and day
        const isSameDay =
          bloodCollectionDate.getFullYear() ===
            appointmentDateTime.getFullYear() &&
          bloodCollectionDate.getMonth() === appointmentDateTime.getMonth() &&
          bloodCollectionDate.getDate() === appointmentDateTime.getDate();

        if (!isSameDay) {
          const formattedDate = campaign.bloodCollectionDate
            .toISOString()
            .split('T')[0];
          throw new BadRequestException(
            `Appointment date must be on the exact same day as the blood collection date (${formattedDate})`,
          );
        }
      }
    }

    const donationRequest = this.em.create(CampaignDonation, {
      campaign,
      donor,
      currentStatus: CampaignDonationStatus.PENDING,
      appointmentDate: appointmentDateTime,
    });

    await this.em.persistAndFlush(donationRequest);

    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.PENDING,
      note: note || 'Donation request created',
    });

    await this.em.persistAndFlush(log);

    return donationRequest;
  }

  async getDonationRequestById(
    donationRequestId: string,
    customerId?: string,
  ): Promise<CampaignDonation> {
    const query: any = { id: donationRequestId };

    if (customerId) {
      query.donor = { id: customerId };
    }

    const donationRequest = await this.em.findOne(CampaignDonation, query, {
      populate: ['donor', 'campaign'],
    });

    if (!donationRequest) {
      throw new NotFoundException(
        `Donation request with ID ${donationRequestId} not found`,
      );
    }

    // Get logs for this donation request
    const logs = await this.em.find(
      CampaignDonationLog,
      { campaignDonation: donationRequest },
      { populate: ['staff'] },
    );

    // Manually add logs to the result
    (donationRequest as any).logs = logs;

    return donationRequest;
  }

  async getDonationRequests(
    query: DonationRequestListQueryDtoType,
    customerId?: string,
  ): Promise<{ items: CampaignDonation[]; total: number }> {
    const { page, limit, status } = query;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.donor = { id: customerId };
    }

    if (status) {
      where.currentStatus = this.mapDonationStatusToCampaignStatus(status);
    }

    const [items, total] = await this.em.findAndCount(CampaignDonation, where, {
      populate: ['donor', 'campaign'],
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  @Transactional()
  async cancelDonationRequest(
    donationRequestId: string,
    customerId: string,
  ): Promise<CampaignDonation> {
    const donationRequest = await this.getDonationRequestById(
      donationRequestId,
      customerId,
    );

    if (donationRequest.currentStatus !== CampaignDonationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending donation requests can be cancelled',
      );
    }

    donationRequest.currentStatus = CampaignDonationStatus.REJECTED;

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.REJECTED,
      note: 'Donation request cancelled by donor',
    });

    await this.em.persistAndFlush([donationRequest, log]);

    return donationRequest;
  }

  @Transactional()
  async updateDonationRequestStatus(
    donationRequestId: string,
    staff: Staff,
    data: UpdateDonationRequestStatusDtoType,
  ): Promise<CampaignDonation> {
    const { status, note, appointmentDate } = data;
    const donationRequest =
      await this.getDonationRequestById(donationRequestId);

    const newStatus = this.mapDonationStatusToCampaignStatus(status);

    if (donationRequest.currentStatus === newStatus) {
      throw new BadRequestException(
        `Donation request is already in ${newStatus} status`,
      );
    }

    if (donationRequest.currentStatus === CampaignDonationStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot update a rejected/cancelled donation request',
      );
    }

    if (
      donationRequest.currentStatus === CampaignDonationStatus.RESULT_RETURNED
    ) {
      throw new BadRequestException(
        'Cannot update a donation request that has already completed the entire process',
      );
    }

    // Validate status transitions
    this.validateStatusTransition(donationRequest.currentStatus, newStatus);

    const oldStatus = donationRequest.currentStatus;
    donationRequest.currentStatus = newStatus;

    // Update appointment date if provided
    if (appointmentDate) {
      const appointmentDateTime = new Date(appointmentDate);

      // Get the campaign to check bloodCollectionDate
      const campaign = await this.em.findOne(Campaign, {
        id: donationRequest.campaign.id,
      });

      // If campaign has a bloodCollectionDate, appointment must be on the same day
      if (campaign && campaign.bloodCollectionDate) {
        const bloodCollectionDate = new Date(campaign.bloodCollectionDate);

        // Compare only year, month, and day
        const isSameDay =
          bloodCollectionDate.getFullYear() ===
            appointmentDateTime.getFullYear() &&
          bloodCollectionDate.getMonth() === appointmentDateTime.getMonth() &&
          bloodCollectionDate.getDate() === appointmentDateTime.getDate();

        if (!isSameDay) {
          const formattedDate = campaign.bloodCollectionDate
            .toISOString()
            .split('T')[0];
          throw new BadRequestException(
            `Appointment date must be on the exact same day as the blood collection date (${formattedDate})`,
          );
        }
      }

      donationRequest.appointmentDate = appointmentDateTime;
    }

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      staff,
    });

    // If status is changing to COMPLETED, create a DonationResult
    if (newStatus === CampaignDonationStatus.COMPLETED) {
      await this.createDonationResult(donationRequest, staff, note);
    }

    await this.em.persistAndFlush([donationRequest, log]);

    return donationRequest;
  }

  /**
   * Creates a donation result when blood collection is completed
   */
  @Transactional()
  private async createDonationResult(
    campaignDonation: CampaignDonation,
    staff: Staff,
    note?: string,
  ): Promise<DonationResult> {
    // Check if a donation result already exists
    const existingResult = await this.em.findOne(DonationResult, {
      campaignDonation: { id: campaignDonation.id },
    });

    if (existingResult) {
      this.logger.log(
        `DonationResult already exists for donation ${campaignDonation.id}`,
      );
      return existingResult;
    }

    // Create new donation result
    const donationResult = this.em.create(DonationResult, {
      campaignDonation,
      resultDate: new Date(),
      notes: note || 'Blood collection completed, awaiting test results',
      processedBy: staff,
    });

    await this.em.persistAndFlush(donationResult);
    this.logger.log(
      `Created DonationResult for donation ${campaignDonation.id}`,
    );

    return donationResult;
  }

  /**
   * Validates that the status transition is allowed
   */
  private validateStatusTransition(
    currentStatus: CampaignDonationStatus,
    newStatus: CampaignDonationStatus,
  ): void {
    // Define allowed transitions
    const allowedTransitions: Record<
      CampaignDonationStatus,
      CampaignDonationStatus[]
    > = {
      [CampaignDonationStatus.PENDING]: [
        CampaignDonationStatus.REJECTED,
        CampaignDonationStatus.APPOINTMENT_CONFIRMED,
      ],
      [CampaignDonationStatus.APPOINTMENT_CONFIRMED]: [
        CampaignDonationStatus.APPOINTMENT_CANCELLED,
        CampaignDonationStatus.APPOINTMENT_ABSENT,
        CampaignDonationStatus.COMPLETED,
      ],
      [CampaignDonationStatus.APPOINTMENT_CANCELLED]: [],
      [CampaignDonationStatus.APPOINTMENT_ABSENT]: [],
      [CampaignDonationStatus.COMPLETED]: [
        CampaignDonationStatus.RESULT_RETURNED,
      ],
      [CampaignDonationStatus.RESULT_RETURNED]: [],
      [CampaignDonationStatus.REJECTED]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  // Helper method to map between status enums
  private mapDonationStatusToCampaignStatus(
    status: string,
  ): CampaignDonationStatus {
    switch (status) {
      case 'pending':
        return CampaignDonationStatus.PENDING;
      case 'completed':
        return CampaignDonationStatus.COMPLETED;
      case 'result_returned':
        return CampaignDonationStatus.RESULT_RETURNED;
      case 'appointment_confirmed':
        return CampaignDonationStatus.APPOINTMENT_CONFIRMED;
      case 'appointment_cancelled':
        return CampaignDonationStatus.APPOINTMENT_CANCELLED;
      case 'appointment_absent':
        return CampaignDonationStatus.APPOINTMENT_ABSENT;
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return CampaignDonationStatus.REJECTED;
      default:
        return CampaignDonationStatus.PENDING;
    }
  }

  /**
   * Get donation result by donation request ID
   */
  async getDonationResultByDonationId(
    donationRequestId: string,
  ): Promise<DonationResult> {
    const donationResult = await this.em.findOne(
      DonationResult,
      { campaignDonation: { id: donationRequestId } },
      {
        populate: ['campaignDonation', 'campaignDonation.donor', 'processedBy'],
      },
    );

    if (!donationResult) {
      throw new NotFoundException(
        `No donation result found for donation request ${donationRequestId}`,
      );
    }

    return donationResult;
  }

  /**
   * Update donation result and set status to RESULT_RETURNED if needed
   */
  @Transactional()
  async updateDonationResult(
    donationRequestId: string,
    staff: Staff,
    data: UpdateDonationResultDtoType,
  ): Promise<DonationResult> {
    // Get the donation request
    const donationRequest =
      await this.getDonationRequestById(donationRequestId);

    // Check if the donation is in COMPLETED status
    if (donationRequest.currentStatus !== CampaignDonationStatus.COMPLETED) {
      throw new BadRequestException(
        `Donation request must be in COMPLETED status to update results. Current status: ${donationRequest.currentStatus}`,
      );
    }

    // Get or create donation result
    let donationResult: DonationResult;
    try {
      donationResult =
        await this.getDonationResultByDonationId(donationRequestId);
    } catch (error) {
      // Create a new donation result if it doesn't exist
      donationResult = await this.createDonationResult(
        donationRequest,
        staff,
        data.notes,
      );
    }

    // Update the donation result
    if (data.bloodTestResults) {
      donationResult.bloodTestResults = data.bloodTestResults;
    }

    if (data.notes) {
      donationResult.notes = data.notes;
    }

    donationResult.resultDate = new Date();
    donationResult.processedBy = staff;

    // Update donation status to RESULT_RETURNED
    donationRequest.currentStatus = CampaignDonationStatus.RESULT_RETURNED;

    // Create log for status change
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.RESULT_RETURNED,
      note: data.notes || 'Test results returned',
      staff,
    });

    await this.em.persistAndFlush([donationResult, donationRequest, log]);

    return donationResult;
  }

  /**
   * List all donation results with pagination
   */
  async getDonationResults(options: {
    page?: number;
    limit?: number;
  }): Promise<{ items: DonationResult[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const [items, total] = await this.em.findAndCount(
      DonationResult,
      {},
      {
        populate: ['campaignDonation', 'campaignDonation.donor', 'processedBy'],
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return { items, total };
  }
}
