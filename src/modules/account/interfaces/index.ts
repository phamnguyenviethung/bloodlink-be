import { Customer, Staff } from '@/database/entities/Account.entity';
import {
  UpdateCustomerProfileDtoType,
  UpdateStaffProfileDtoType,
} from '../dtos';

export interface ICustomerService {
  getMe(customerId: string): Promise<any>;
  updateCustomer(
    customerId: string,
    data: UpdateCustomerProfileDtoType,
  ): Promise<Customer>;
}

export interface IHospitalService {}

export interface IStaffService {
  getMe(staffId: string): Promise<Staff>;
  updateStaff(staffId: string, data: UpdateStaffProfileDtoType): Promise<Staff>;
}

export enum ClerkWebhookType {
  UserCreated = 'user.created',
  UserUpdated = 'user.updated',
  UserDeleted = 'user.deleted',
}

export interface ClerkWebhookPayload {
  type: ClerkWebhookType;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    gender: string;
    birthday: string;
    email_addresses: {
      email_address: string;
    }[];
    image_url: string;
    username: string;
    public_metadata: Record<string, any>;
    private_metadata: Record<string, any>;
    unsafe_metadata: Record<string, any>;
  };
}
