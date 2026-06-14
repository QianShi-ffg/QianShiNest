import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { MiniappController } from './miniapp.controller';
import { MiniappService } from './miniapp.service';
import { MiniappUser } from './entities/miniapp-user.entity';
import { MiniappToolUsage } from './entities/miniapp-tool-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiniappUser, MiniappToolUsage]),
    AuthModule,
  ],
  controllers: [MiniappController],
  providers: [MiniappService],
})
export class MiniappModule {}
