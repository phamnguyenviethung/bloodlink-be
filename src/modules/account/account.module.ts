import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import {
  ClerkAdminClientProvider,
  ClerkClientProvider,
} from '@/share/providers/clerk.provider';
import { HospitalController } from './controllers/hospital.controller';
import { HospitalSerivce } from './services/hospital.service';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  controllers: [
    CustomerController,
    HospitalController,
    StaffController,
    AdminController,
  ],
  providers: [
    CustomerService,
    ClerkClientProvider,
    HospitalSerivce,
    ClerkAdminClientProvider,
    StaffService,
    AdminService,
  ],
  exports: [CustomerService, HospitalSerivce, StaffService, AdminService],
})
export class AccountModule {}
