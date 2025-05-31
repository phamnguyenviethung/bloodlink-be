import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';
import {
  ClerkAdminClientProvider,
  ClerkClientProvider,
} from '@/share/providers/clerk.provider';
import { HospitalController } from './controllers/hospital.controller';
import { HospitalSerivce } from './services/hospital.service';

@Module({
  controllers: [CustomerController, HospitalController],
  providers: [
    CustomerService,
    ClerkClientProvider,
    HospitalSerivce,
    ClerkAdminClientProvider,
  ],
  exports: [CustomerService, HospitalSerivce],
})
export class AccountModule {}
