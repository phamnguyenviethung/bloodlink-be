import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog } from '@/database/entities/blog.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Blog])],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
