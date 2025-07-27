import { Customer, Staff } from '@/database/entities/Account.entity';
import {
  BloodGroup,
  BloodRh,
  BloodType,
} from '@/database/entities/Blood.entity';
import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
  DonationReminder,
  DonationResult,
  DonationResultStatus,
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
import { ReminderService } from './reminder.service';

@Injectable()
export class DonationService {
  private readonly logger = new Logger(DonationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly reminderService: ReminderService,
  ) {}

  @Transactional()
  async createDonationRequest(
    customerId: string,
    data: CreateDonationRequestDtoType,
  ): Promise<CampaignDonation> {
    const { campaignId, note, appointmentDate, volumeMl } = data;

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

    // Check if donor has any active donation requests
    const activeDonationRequest = await this.em.findOne(CampaignDonation, {
      donor: { id: customerId },
      currentStatus: {
        $in: [
          CampaignDonationStatus.APPOINTMENT_CONFIRMED,
          CampaignDonationStatus.CUSTOMER_CHECKED_IN,
          CampaignDonationStatus.COMPLETED,
        ],
      },
    });

    if (activeDonationRequest) {
      throw new BadRequestException(
        `You already have an active donation request. Please complete or cancel your current request before creating a new one.`,
      );
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

    // Set default volume or use provided volume
    const initialVolumeMl = volumeMl !== undefined ? volumeMl : 0;

    const donationRequest = this.em.create(CampaignDonation, {
      campaign,
      donor,
      currentStatus: CampaignDonationStatus.APPOINTMENT_CONFIRMED,
      appointmentDate: appointmentDateTime,
      volumeMl: initialVolumeMl,
    });

    await this.em.persistAndFlush(donationRequest);

    const log = this.em.create(CampaignDonationLog, {
      campaignDonation: donationRequest,
      status: CampaignDonationStatus.APPOINTMENT_CONFIRMED,
      note: note || 'Donation request created',
    });

    await this.em.persistAndFlush(log);

    // Create before-donation reminder since status is already APPOINTMENT_CONFIRMED
    try {
      await this.reminderService.createBeforeDonationReminder(donationRequest);
      this.logger.log(
        `Created before-donation reminder for donation ${donationRequest.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create before-donation reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw the error - we still want to create the donation request even if reminder creation fails
    }

    // Create before-donation reminder since status is already APPOINTMENT_CONFIRMED
    try {
      await this.reminderService.createBeforeDonationReminder(donationRequest);
      this.logger.log(
        `Created before-donation reminder for donation ${donationRequest.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create before-donation reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw the error - we still want to create the donation request even if reminder creation fails
    }

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
    const { page, limit, status, campaignId } = query;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.donor = { id: customerId };
    }

    if (status) {
      where.currentStatus = status;
      where.currentStatus = status;
    }

    if (campaignId) {
      where.campaign = { id: campaignId };
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
      donationRequest.currentStatus !==
      CampaignDonationStatus.APPOINTMENT_CONFIRMED
    ) {
      throw new BadRequestException(
        'Only confirmed donation requests can be cancelled',
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

  @Transactional()
  async updateDonationRequestStatus(
    donationRequestId: string,
    staff: Staff,
    data: UpdateDonationRequestStatusDtoType,
  ): Promise<CampaignDonation> {
    const { status: newStatus, note, appointmentDate, volumeMl } = data;

    // Find donation request
    const donationRequest = await this.em.findOne(
      CampaignDonation,
      { id: donationRequestId },
      { populate: ['donor', 'campaign'] },
    );

    if (!donationRequest) {
      throw new NotFoundException(
        `Donation request with ID ${donationRequestId} not found`,
      );
    }

    const oldStatus = donationRequest.currentStatus;

    // Validate status transition
    this.validateStatusTransition(oldStatus, newStatus);

    const statusesRequiringDateCheck = [
      CampaignDonationStatus.CUSTOMER_CHECKED_IN,
      CampaignDonationStatus.COMPLETED,
      CampaignDonationStatus.NOT_QUALIFIED,
      CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN,
    ];

    if (statusesRequiringDateCheck.includes(newStatus)) {
      const now = new Date();
      const bloodCollectionDate = donationRequest.campaign.bloodCollectionDate;

      if (bloodCollectionDate) {
        // Compare dates (ignoring time)
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const collectionDay = new Date(
          bloodCollectionDate.getFullYear(),
          bloodCollectionDate.getMonth(),
          bloodCollectionDate.getDate(),
        );

        if (today < collectionDay) {
          throw new BadRequestException(
            `Cannot update status to ${newStatus}. The blood collection date (${bloodCollectionDate.toISOString().split('T')[0]}) has not been reached yet.`,
          );
        }
      }
    }

    // Update status
    donationRequest.currentStatus = newStatus;

    // If status is COMPLETED, update the volumeMl if provided
    if (
      newStatus === CampaignDonationStatus.COMPLETED &&
      volumeMl !== undefined
    ) {
      donationRequest.volumeMl = volumeMl;
      this.logger.log(
        `Updated volumeMl to ${volumeMl} for donation ${donationRequestId}`,
      );
    }

    // If status is COMPLETED or RESULT_RETURNED, update the lastDonationDate for the donor
    if (
      newStatus === CampaignDonationStatus.COMPLETED ||
      newStatus === CampaignDonationStatus.RESULT_RETURNED
    ) {
      // Update the lastDonationDate field for the donor
      donationRequest.donor.lastDonationDate = new Date();
    }

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

    // Create reminders based on status transitions
    try {
      // Create before-donation reminder when appointment is confirmed
      if (newStatus === CampaignDonationStatus.APPOINTMENT_CONFIRMED) {
        await this.reminderService.createBeforeDonationReminder(
          donationRequest,
        );
        this.logger.log(
          `Created before-donation reminder for donation ${donationRequestId}`,
        );
      }

      // Create after-donation reminder when donation is completed
      if (newStatus === CampaignDonationStatus.COMPLETED) {
        await this.reminderService.createAfterDonationReminder(donationRequest);
        this.logger.log(
          `Created after-donation reminder for donation ${donationRequestId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw the error - we still want to update the status even if reminder creation fails
    }

    // Send email notification
    await this.sendStatusChangeEmail(donationRequest);

    return donationRequest;
  }

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

    // Create new donation result with default values
    const donationResult = this.em.create(DonationResult, {
      campaignDonation,
      volumeMl: 0, // Default volume, to be updated later
      bloodGroup: BloodGroup.O, // Default blood group
      bloodRh: BloodRh.POSITIVE, // Default blood Rh
      notes: note || 'Blood collection completed',
      status: DonationResultStatus.RESULT_NOT_QUALIFIED,
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
      [CampaignDonationStatus.APPOINTMENT_CONFIRMED]: [
        CampaignDonationStatus.APPOINTMENT_CANCELLED,
        CampaignDonationStatus.APPOINTMENT_ABSENT,
        CampaignDonationStatus.CUSTOMER_CANCELLED,
        CampaignDonationStatus.CUSTOMER_CHECKED_IN,
      ],
      [CampaignDonationStatus.CUSTOMER_CHECKED_IN]: [
        CampaignDonationStatus.COMPLETED,
        CampaignDonationStatus.NOT_QUALIFIED,
        CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN,
      ],
      [CampaignDonationStatus.APPOINTMENT_CANCELLED]: [],
      [CampaignDonationStatus.APPOINTMENT_ABSENT]: [],
      [CampaignDonationStatus.COMPLETED]: [
        CampaignDonationStatus.RESULT_RETURNED,
      ],
      [CampaignDonationStatus.RESULT_RETURNED]: [],
      [CampaignDonationStatus.NOT_QUALIFIED]: [],
      [CampaignDonationStatus.CUSTOMER_CANCELLED]: [],
      [CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
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

    // Update the donation result with new fields
    donationResult.volumeMl = data.volumeMl;
    donationResult.status = data.status;
    donationResult.bloodGroup = data.bloodGroup;
    donationResult.bloodRh = data.bloodRh;

    if (data.notes) {
      donationResult.notes = data.notes;
    }

    if (data.rejectReason) {
      donationResult.rejectReason = data.rejectReason;
    }

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

    // Update donor's blood type if canChangeBloodType is true
    await this.updateDonorBloodTypeIfNeeded(
      donationRequest.donor,
      data.bloodGroup,
      data.bloodRh,
    );

    return donationResult;
  }

  /**
   * Update the donor's blood type if canChangeBloodType is true
   */
  private async updateDonorBloodTypeIfNeeded(
    donor: Customer,
    bloodGroup: BloodGroup,
    bloodRh: BloodRh,
  ): Promise<void> {
    try {
      await this.em.populate(donor, ['bloodType']);

      if (donor.canChangeBloodType) {
        const bloodType = await this.em.findOne(BloodType, {
          group: bloodGroup,
          rh: bloodRh,
        });

        donor.bloodType = bloodType;
        donor.canChangeBloodType = false;
        await this.em.persistAndFlush(donor);

        this.logger.log(
          `Updated donor ${donor.id} blood type to ${bloodGroup}${bloodRh} and set canChangeBloodType to false`,
        );
      } else {
        this.logger.log(
          `Skipped updating donor ${donor.id} blood type because canChangeBloodType is false`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating donor blood type: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

    // Delete reminders
    await this.em.nativeDelete(DonationReminder, {
      campaignDonation: { id: donationRequestId },
    });
    this.logger.log(`Deleted reminders for request ${donationRequestId}`);
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
    const baseUrl = 'https://dev.bloodlink.site'; // Replace with your actual base URL

    switch (donationRequest.currentStatus) {
      case CampaignDonationStatus.APPOINTMENT_CONFIRMED:
        return {
          subject: 'Xác Nhận Lịch Hẹn Hiến Máu',
          message: 'Lịch hẹn hiến máu của quý vị đã được xác nhận!',
          actionRequired: 'Vui lòng đến trước giờ hẹn 15 phút',
          actionUrl: `${baseUrl}/donation-history`,
          additionalInfo:
            'Hãy nhớ ăn uống đầy đủ và uống nhiều nước trước khi đến lịch hẹn.',
        };

      case CampaignDonationStatus.APPOINTMENT_CANCELLED:
        return {
          subject: 'Lịch Hẹn Hiến Máu Đã Bị Hủy',
          message: 'Lịch hẹn hiến máu của quý vị đã bị hủy.',
          actionRequired: 'Đặt Lại Lịch Hẹn',
          actionUrl: `${baseUrl}/campaigns`,
          additionalInfo:
            'Nếu quý vị không yêu cầu hủy lịch, vui lòng liên hệ với chúng tôi.',
        };

      case CampaignDonationStatus.CUSTOMER_CHECKED_IN:
        return {
          subject: 'Xác Nhận Đã Có Mặt Tại Điểm Hiến Máu',
          message:
            'Quý vị đã được ghi nhận có mặt tại điểm hiến máu theo lịch hẹn.',
          additionalInfo:
            'Nhân viên y tế sẽ hỗ trợ quý vị trong thời gian sớm nhất.',
        };

      case CampaignDonationStatus.COMPLETED:
        return {
          subject: 'Hiến Máu Thành Công - Xin Chân Thành Cảm Ơn!',
          message: 'Quý vị đã hoàn thành quá trình hiến máu thành công.',
          additionalInfo:
            'Xin chân thành cảm ơn vì đóng góp quý giá của quý vị trong việc cứu sống nhiều người!',
        };

      case CampaignDonationStatus.RESULT_RETURNED:
        return {
          subject: 'Kết Quả Hiến Máu Đã Sẵn Sàng',
          message: 'Kết quả xét nghiệm máu của quý vị hiện đã có sẵn.',
          actionRequired: 'Xem Kết Quả',
          actionUrl: `${baseUrl}/donation-history`,
          additionalInfo:
            'Vui lòng xem kết quả và liên hệ với chúng tôi nếu quý vị có bất kỳ thắc mắc nào.',
        };

      case CampaignDonationStatus.CUSTOMER_CANCELLED:
        return {
          subject: 'Yêu Cầu Hiến Máu Đã Được Hủy',
          message: 'Yêu cầu hiến máu của quý vị đã được hủy theo yêu cầu.',
          actionRequired: 'Đặt Lịch Hẹn Mới',
          actionUrl: `${baseUrl}`,
          additionalInfo:
            'Chúng tôi hy vọng sẽ gặp quý vị trong các đợt hiến máu sắp tới.',
        };

      case CampaignDonationStatus.APPOINTMENT_ABSENT:
        return {
          subject: 'Vắng Mặt Tại Lịch Hẹn Hiến Máu',
          message: 'Quý vị đã vắng mặt tại lịch hẹn hiến máu đã đặt.',
          actionRequired: 'Đặt Lại Lịch Hẹn',
          actionUrl: `${baseUrl}`,
          additionalInfo:
            'Vui lòng đặt lại lịch hẹn tại thời điểm thuận tiện nhất.',
        };

      case CampaignDonationStatus.NOT_QUALIFIED:
      case CampaignDonationStatus.NOT_QUALIFIED:
        return {
          subject: 'Cập Nhật Trạng Thái Yêu Cầu Hiến Máu',
          message:
            'Rất tiếc, yêu cầu hiến máu của quý vị không thể được xử lý.',
          additionalInfo:
            'Vui lòng liên hệ với chúng tôi để biết thêm thông tin hoặc tham khảo các phương án hiến máu khác.',
        };

      case CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN:
        return {
          subject: 'Vắng Mặt Sau Khi Đã Đăng Ký',
          message: 'Quý vị đã vắng mặt sau khi đã đăng ký tại điểm hiến máu.',
          actionRequired: 'Đặt Lại Lịch Hẹn',
          actionUrl: `${baseUrl}`,
          additionalInfo:
            'Vui lòng đặt lại lịch hẹn tại thời điểm thuận tiện nhất.',
        };

      case CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN:
        return {
          subject: 'Vắng Mặt Sau Khi Đã Đăng Ký',
          message: 'Quý vị đã vắng mặt sau khi đã đăng ký tại điểm hiến máu.',
          actionRequired: 'Đặt Lại Lịch Hẹn',
          actionUrl: `${baseUrl}`,
          additionalInfo:
            'Vui lòng đặt lại lịch hẹn tại thời điểm thuận tiện nhất.',
        };

      default:
        return {
          subject: 'Cập Nhật Yêu Cầu Hiến Máu',
          message: `Trạng thái yêu cầu hiến máu của quý vị đã được cập nhật thành: ${donationRequest.currentStatus}`,
        };
    }
  }

  /**
   * Update the isBloodUnitCreated field for a donation request
   */
  @Transactional()
  async updateBloodUnitCreatedStatus(
    donationRequestId: string,
    isCreated: boolean = true,
  ): Promise<CampaignDonation> {
    try {
      const donationRequest = await this.em.findOne(CampaignDonation, {
        id: donationRequestId,
      });

      if (!donationRequest) {
        throw new NotFoundException(
          `Donation request with ID ${donationRequestId} not found`,
        );
      }

      donationRequest.isBloodUnitCreated = isCreated;
      await this.em.persistAndFlush(donationRequest);

      this.logger.log(
        `Updated isBloodUnitCreated to ${isCreated} for donation request ${donationRequestId}`,
      );

      return donationRequest;
    } catch (error) {
      this.logger.error(
        `Error updating blood unit created status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
