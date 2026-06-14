import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { LikeRecord } from './entities/like-record.entity';
import { Diary } from '../diary/entities/diary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, LikeRecord, Diary])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
