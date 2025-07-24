import {
  ClerkAdminClientProvider,
  ClerkClientProvider,
} from '@/share/providers/clerk.provider';
import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AdminController } from './controllers/admin.controller';
import { CustomerController } from './controllers/customer.controller';
import { HospitalController } from './controllers/hospital.controller';
import { StaffController } from './controllers/staff.controller';
import { AdminService } from './services/admin.service';
import { CustomerService } from './services/customer.service';
import { HospitalSerivce } from './services/hospital.service';
import { StaffService } from './services/staff.service';

@Module({
  imports: [CloudinaryModule],
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
