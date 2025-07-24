import { Module } from '@nestjs/common';

import { CloudinaryTestController } from './cloudinary-test.controller';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [CloudinaryTestController],
})
export class CloudinaryTestModule {}
