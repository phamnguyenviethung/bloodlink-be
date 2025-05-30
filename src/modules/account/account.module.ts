import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { ClerkClientProvider } from '@/share/providers/clerk.provider';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, ClerkClientProvider],
  exports: [CustomerService],
})
export class AccountModule {}
