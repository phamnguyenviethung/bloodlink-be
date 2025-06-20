import { Module } from '@nestjs/common';
import { EmergencyRequestController } from './emergency-request.controller';
import { EmergencyRequestService } from './emergency-request.service';

@Module({
  controllers: [EmergencyRequestController],
  providers: [EmergencyRequestService],
  exports: [EmergencyRequestService],
})
export class EmergencyRequestModule {}
