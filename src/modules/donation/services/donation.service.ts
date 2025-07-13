import { Customer, Staff } from '@/database/entities/Account.entity';
import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
  DonationResult,
  DonationResultTemplate,
} from '@/database/entities/campaign.entity';
import { EmailService } from '@/modules/email/email.service';
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
} from '../dtos/donation-request.dto';
import { UpdateDonationResultDtoType } from '../dtos/donation-result.dto';

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
  ) {}

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

    // Fetch logs for each donation request
    for (const item of items) {
      const logs = await this.em.find(
        CampaignDonationLog,
        { campaignDonation: item },
        { populate: ['staff'] },
      );
      // Manually add logs to the result
      (item as any).logs = logs;
    }

    return { items, total };
  }

  /**
   * Customer cancels their own donation request
   */
  @Transactional()
  async cancelDonationRequest(
    donationRequestId: string,
    customerId: string,
  ): Promise<CampaignDonation> {
    const donationRequest = await this.getDonationRequestById(
      donationRequestId,
      customerId,
    );

    // Check if the request can be cancelled
    if (
      donationRequest.currentStatus !== CampaignDonationStatus.PENDING &&
      donationRequest.currentStatus !==
        CampaignDonationStatus.APPOINTMENT_CONFIRMED
    ) {
      throw new BadRequestException(
        'Only pending or confirmed donation requests can be cancelled',
      );
    }

    // If the request has a confirmed appointment, check if it's at least 24 hours before
    if (
      donationRequest.currentStatus ===
      CampaignDonationStatus.APPOINTMENT_CONFIRMED
    ) {
      if (!donationRequest.appointmentDate) {
        throw new BadRequestException('Appointment date not found');
      }

      const appointmentTime = new Date(
        donationRequest.appointmentDate,
      ).getTime();
      const currentTime = new Date().getTime();
      const hoursDifference =
        (appointmentTime - currentTime) / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        throw new BadRequestException(
          'Appointments can only be cancelled at least 24 hours before the scheduled time',
        );
      }
    }

    // Update status to CUSTOMER_CANCELLED
    donationRequest.currentStatus = CampaignDonationStatus.CUSTOMER_CANCELLED;

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.CUSTOMER_CANCELLED,
      note: 'Donation request cancelled by donor',
    });

    await this.em.persistAndFlush([donationRequest, log]);

    // Send email notification
    await this.sendStatusChangeEmail(donationRequest);

    return donationRequest;
  }

  /**
   * Complete a donation request (change status to COMPLETED)
   * Creates a DonationResult record automatically
   */
  @Transactional()
  async completeDonationRequest(
    donationRequestId: string,
    staff: Staff,
    note?: string,
  ): Promise<CampaignDonation> {
    const donationRequest =
      await this.getDonationRequestById(donationRequestId);

    // Check if request is in a state that can be completed
    if (
      donationRequest.currentStatus !==
        CampaignDonationStatus.APPOINTMENT_CONFIRMED &&
      donationRequest.currentStatus !==
        CampaignDonationStatus.CUSTOMER_CHECKED_IN
    ) {
      throw new BadRequestException(
        `Only confirmed appointments or checked-in appointments can be completed. Current status: ${donationRequest.currentStatus}`,
      );
    }

    const oldStatus = donationRequest.currentStatus;
    donationRequest.currentStatus = CampaignDonationStatus.COMPLETED;

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.COMPLETED,
      note:
        note ||
        `Status updated from ${oldStatus} to ${CampaignDonationStatus.COMPLETED}`,
      staff,
    });

    // Create a DonationResult
    await this.createDonationResult(donationRequest, staff, note);

    await this.em.persistAndFlush([donationRequest, log]);

    // Send email notification
    await this.sendStatusChangeEmail(donationRequest);

    return donationRequest;
  }

  /**
   * Cancel a donation request by staff (change status to APPOINTMENT_CANCELLED)
   */
  @Transactional()
  async cancelDonationRequestByStaff(
    donationRequestId: string,
    staff: Staff,
    note?: string,
    appointmentDate?: Date | string,
  ): Promise<CampaignDonation> {
    const donationRequest =
      await this.getDonationRequestById(donationRequestId);

    // Check if request can be cancelled
    if (
      donationRequest.currentStatus !==
      CampaignDonationStatus.APPOINTMENT_CONFIRMED
    ) {
      throw new BadRequestException(
        `Only confirmed appointments can be cancelled. Current status: ${donationRequest.currentStatus}`,
      );
    }

    const oldStatus = donationRequest.currentStatus;
    donationRequest.currentStatus =
      CampaignDonationStatus.APPOINTMENT_CANCELLED;

    // Update appointment date if provided
    if (appointmentDate) {
      await this.validateAppointmentDate(donationRequest, appointmentDate);
      donationRequest.appointmentDate = new Date(appointmentDate);
    }

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.APPOINTMENT_CANCELLED,
      note:
        note ||
        `Appointment cancelled by staff. Status updated from ${oldStatus} to ${CampaignDonationStatus.APPOINTMENT_CANCELLED}`,
      staff,
    });

    await this.em.persistAndFlush([donationRequest, log]);

    // Send email notification
    await this.sendStatusChangeEmail(donationRequest);

    return donationRequest;
  }

  /**
   * Update donation request status (for other status changes)
   */
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

    // Handle special cases with dedicated methods
    if (newStatus === CampaignDonationStatus.COMPLETED) {
      return this.completeDonationRequest(donationRequestId, staff, note);
    }

    if (
      newStatus === CampaignDonationStatus.APPOINTMENT_CANCELLED &&
      donationRequest.currentStatus ===
        CampaignDonationStatus.APPOINTMENT_CONFIRMED
    ) {
      return this.cancelDonationRequestByStaff(
        donationRequestId,
        staff,
        note,
        appointmentDate,
      );
    }

    // Continue with general status update logic
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
      await this.validateAppointmentDate(donationRequest, appointmentDate);
      donationRequest.appointmentDate = new Date(appointmentDate);
    }

    // Create log
    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`,
      staff,
    });

    await this.em.persistAndFlush([donationRequest, log]);

    // Send email notification
    await this.sendStatusChangeEmail(donationRequest);

    return donationRequest;
  }

  /**
   * Validates appointment date against campaign's bloodCollectionDate
   */
  private async validateAppointmentDate(
    donationRequest: CampaignDonation,
    appointmentDate: Date | string,
  ): Promise<void> {
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
        CampaignDonationStatus.CUSTOMER_CANCELLED,
      ],
      [CampaignDonationStatus.APPOINTMENT_CONFIRMED]: [
        CampaignDonationStatus.APPOINTMENT_CANCELLED,
        CampaignDonationStatus.APPOINTMENT_ABSENT,
        CampaignDonationStatus.COMPLETED,
        CampaignDonationStatus.CUSTOMER_CANCELLED,
        CampaignDonationStatus.CUSTOMER_CHECKED_IN,
      ],
      [CampaignDonationStatus.CUSTOMER_CHECKED_IN]: [
        CampaignDonationStatus.COMPLETED,
      ],
      [CampaignDonationStatus.APPOINTMENT_CANCELLED]: [],
      [CampaignDonationStatus.APPOINTMENT_ABSENT]: [],
      [CampaignDonationStatus.COMPLETED]: [
        CampaignDonationStatus.RESULT_RETURNED,
      ],
      [CampaignDonationStatus.RESULT_RETURNED]: [],
      [CampaignDonationStatus.REJECTED]: [],
      [CampaignDonationStatus.CUSTOMER_CANCELLED]: [],
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
      case 'customer_cancelled':
        return CampaignDonationStatus.CUSTOMER_CANCELLED;
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

    // Handle template data - only use templateId
    if (data.templateId) {
      // Fetch the template and convert to JSON
      const templateJson = await this.getTemplateAsJson(data.templateId);
      if (templateJson) {
        donationResult.template = templateJson;
      } else {
        throw new NotFoundException(
          `Template with ID ${data.templateId} not found`,
        );
      }
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

  /**
   * Delete a donation request and all related data (logs, results)
   * WARNING: This method is for development use only!
   */
  @Transactional()
  async deleteDonationRequest(donationRequestId: string): Promise<void> {
    this.logger.warn(
      `[DEV ONLY] Deleting donation request ${donationRequestId} and all related data`,
    );

    // Find the donation request
    const donationRequest = await this.em.findOne(CampaignDonation, {
      id: donationRequestId,
    });
    if (!donationRequest) {
      this.logger.warn(
        `Donation request ${donationRequestId} not found, nothing to delete`,
      );
      return;
    }

    // Delete donation results
    await this.em.nativeDelete(DonationResult, {
      campaignDonation: { id: donationRequestId },
    });
    this.logger.log(
      `Deleted donation results for request ${donationRequestId}`,
    );

    // Delete donation logs
    await this.em.nativeDelete(CampaignDonationLog, {
      campaignDonation: { id: donationRequestId },
    });
    this.logger.log(`Deleted donation logs for request ${donationRequestId}`);

    // Finally delete the donation request itself
    await this.em.nativeDelete(CampaignDonation, { id: donationRequestId });
    this.logger.log(`Deleted donation request ${donationRequestId}`);
  }

  /**
   * Helper method to fetch a template by ID and convert it to JSON for storage
   * This ensures that even if the template changes in the future, the result maintains its original structure
   */
  private async getTemplateAsJson(
    templateId: string,
  ): Promise<Record<string, any> | null> {
    try {
      const template = await this.em.findOne(
        DonationResultTemplate,
        { id: templateId },
        { populate: ['items', 'items.options'] },
      );

      if (!template) {
        return null;
      }

      // Convert to plain object
      const templateJson = {
        id: template.id,
        name: template.name,
        description: template.description,
        items: template.items.map((item) => ({
          id: item.id,
          type: item.type,
          label: item.label,
          description: item.description,
          placeholder: item.placeholder,
          defaultValue: item.defaultValue,
          sortOrder: item.sortOrder,
          minValue: item.minValue,
          maxValue: item.maxValue,
          minLength: item.minLength,
          maxLength: item.maxLength,
          isRequired: item.isRequired,
          pattern: item.pattern,
          options: item.options?.map((option) => ({
            id: option.id,
            label: option.label,
          })),
        })),
      };

      return templateJson;
    } catch (error) {
      this.logger.error(
        `Error fetching template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Send email notification when donation request status changes
   */
  private async sendStatusChangeEmail(
    donationRequest: CampaignDonation,
  ): Promise<void> {
    try {
      // Make sure donor and campaign are populated
      await this.em.populate(donationRequest, [
        'donor',
        'donor.account',
        'campaign',
      ]);

      if (!donationRequest.donor?.account?.email) {
        this.logger.warn(
          `Cannot send status change email: donor email not found for donation ${donationRequest.id}`,
        );
        return;
      }

      // Get status-specific email content
      const emailContent = this.getStatusEmailContent(donationRequest);

      await this.emailService.sendEmail({
        to: donationRequest.donor.account.email,
        subject: emailContent.subject,
        html: this.emailService.convertToHTML('campaign/confirmRequest', {
          donorName: donationRequest.donor.firstName || 'Donor',
          campaignName: donationRequest.campaign.name,
          status: donationRequest.currentStatus,
          statusMessage: emailContent.message,
          appointmentDate: donationRequest.appointmentDate
            ? new Date(donationRequest.appointmentDate).toLocaleString()
            : null,
          actionRequired: emailContent.actionRequired,
          actionUrl: emailContent.actionUrl,
          additionalInfo: emailContent.additionalInfo,
        }),
      });

      this.logger.log(
        `Status change email sent to ${donationRequest.donor.account.email} for donation ${donationRequest.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send status change email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get email content based on donation request status
   */
  private getStatusEmailContent(donationRequest: CampaignDonation): {
    subject: string;
    message: string;
    actionRequired?: string;
    actionUrl?: string;
    additionalInfo?: string;
  } {
    const baseUrl = 'https://bloodlink.com'; // Replace with your actual base URL

    switch (donationRequest.currentStatus) {
      case CampaignDonationStatus.PENDING:
        return {
          subject: 'Blood Donation Request Received',
          message:
            'Your blood donation request has been received and is pending review.',
          additionalInfo:
            'We will notify you once your request has been processed.',
        };

      case CampaignDonationStatus.APPOINTMENT_CONFIRMED:
        return {
          subject: 'Blood Donation Appointment Confirmed',
          message: 'Your blood donation appointment has been confirmed!',
          actionRequired: 'Please arrive 15 minutes before your scheduled time',
          actionUrl: `${baseUrl}/donations/${donationRequest.id}`,
          additionalInfo:
            'Remember to eat well and stay hydrated before your appointment.',
        };

      case CampaignDonationStatus.APPOINTMENT_CANCELLED:
        return {
          subject: 'Blood Donation Appointment Cancelled',
          message: 'Your blood donation appointment has been cancelled.',
          actionRequired: 'Reschedule Appointment',
          actionUrl: `${baseUrl}/campaigns/${donationRequest.campaign.id}`,
          additionalInfo:
            'If you did not request this cancellation, please contact us.',
        };

      case CampaignDonationStatus.CUSTOMER_CHECKED_IN:
        return {
          subject: 'Check-in Confirmed for Blood Donation',
          message:
            'You have been checked in for your blood donation appointment.',
          additionalInfo: 'A staff member will assist you shortly.',
        };

      case CampaignDonationStatus.COMPLETED:
        return {
          subject: 'Blood Donation Completed - Thank You!',
          message: 'Your blood donation has been successfully completed.',
          additionalInfo:
            'Thank you for your generous contribution to saving lives!',
        };

      case CampaignDonationStatus.RESULT_RETURNED:
        return {
          subject: 'Your Blood Donation Results Are Ready',
          message: 'Your blood donation test results are now available.',
          actionRequired: 'View Results',
          actionUrl: `${baseUrl}/donations/${donationRequest.id}/results`,
          additionalInfo:
            'Please review your results and contact us if you have any questions.',
        };

      case CampaignDonationStatus.CUSTOMER_CANCELLED:
        return {
          subject: 'Blood Donation Request Cancelled',
          message:
            'Your blood donation request has been cancelled as requested.',
          actionRequired: 'Schedule New Appointment',
          actionUrl: `${baseUrl}/campaigns`,
          additionalInfo:
            'We hope to see you at a future blood donation event.',
        };

      case CampaignDonationStatus.APPOINTMENT_ABSENT:
        return {
          subject: 'Missed Blood Donation Appointment',
          message: 'You missed your scheduled blood donation appointment.',
          actionRequired: 'Reschedule Appointment',
          actionUrl: `${baseUrl}/campaigns`,
          additionalInfo: 'Please reschedule at your earliest convenience.',
        };

      case CampaignDonationStatus.REJECTED:
        return {
          subject: 'Blood Donation Request Status Update',
          message:
            'Unfortunately, your blood donation request could not be processed.',
          additionalInfo:
            'Please contact us for more information or to discuss alternative donation options.',
        };

      default:
        return {
          subject: 'Blood Donation Request Update',
          message: `Your donation request status has been updated to: ${donationRequest.currentStatus}`,
        };
    }
  }
}
