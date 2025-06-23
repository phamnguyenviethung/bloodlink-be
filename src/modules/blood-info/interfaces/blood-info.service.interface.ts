import {
  BloodGroup,
  BloodRh,
  BloodComponentType,
} from '../../../database/entities/Blood.entity';
import {
  BloodInfoResponseDto,
  BloodCompatibilityResponseDto,
} from '../dtos/blood-info-response.dto';

export interface IBloodInfoService {
  /**
   * Get all blood type information for customers
   */
  getAllBloodTypeInfo(): Promise<BloodInfoResponseDto[]>;

  /**
   * Get specific blood type information
   */
  getBloodTypeInfo(
    group: BloodGroup,
    rh: BloodRh,
  ): Promise<BloodInfoResponseDto>;

  /**
   * Get blood compatibility information for a specific blood type and component
   */
  getBloodCompatibility(
    group: BloodGroup,
    rh: BloodRh,
    componentType?: BloodComponentType,
  ): Promise<BloodCompatibilityResponseDto[]>;

  /**
   * Search compatible donors for a recipient
   */
  searchCompatibleDonors(
    recipientGroup: BloodGroup,
    recipientRh: BloodRh,
    componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]>;

  /**
   * Search compatible recipients for a donor
   */
  searchCompatibleRecipients(
    donorGroup: BloodGroup,
    donorRh: BloodRh,
    componentType: BloodComponentType,
  ): Promise<BloodInfoResponseDto[]>;
}
