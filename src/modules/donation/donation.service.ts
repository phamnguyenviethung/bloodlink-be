import { Customer } from '@/database/entities/Account.entity';
import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
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

    const donationRequest = this.em.create(CampaignDonation, {
      campaign,
      donor,
      currentStatus: CampaignDonationStatus.PENDING,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
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
    staffId: string,
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
        'Cannot update a cancelled donation request',
      );
    }

    if (donationRequest.currentStatus === CampaignDonationStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot update a completed donation request',
      );
    }

    const oldStatus = donationRequest.currentStatus;
    donationRequest.currentStatus = newStatus;

    // Update appointment date if provided
    if (appointmentDate) {
      donationRequest.appointmentDate = new Date(appointmentDate);
    }

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      staff: { id: staffId },
    });

    await this.em.persistAndFlush([donationRequest, log]);

    return donationRequest;
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
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return CampaignDonationStatus.REJECTED;
      default:
        return CampaignDonationStatus.PENDING;
    }
  }
}
