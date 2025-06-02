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

@Module({
  controllers: [CustomerController, HospitalController, StaffController],
  providers: [
    CustomerService,
    ClerkClientProvider,
    HospitalSerivce,
    ClerkAdminClientProvider,
    StaffService,
  ],
  exports: [CustomerService, HospitalSerivce, StaffService],
})
export class AccountModule {}
