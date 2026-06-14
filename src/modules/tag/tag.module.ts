import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagList } from './entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagList])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
