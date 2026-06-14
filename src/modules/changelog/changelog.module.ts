import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangelogController } from './changelog.controller';
import { ChangelogService } from './changelog.service';
import { Changelog } from './entities/changelog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Changelog])],
  controllers: [ChangelogController],
  providers: [ChangelogService],
})
export class ChangelogModule {}
