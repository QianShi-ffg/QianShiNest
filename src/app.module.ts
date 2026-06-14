import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './modules/article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ClassifyModule } from './modules/classify/classify.module';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FriendShipModule } from './modules/friend-ship/friend-ship.module';
import { ScheduleModule } from '@nestjs/schedule'; // 定时任务
import { TasksModule } from './schedule/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CountToken } from './entities/token.entity';
import { AuthModule } from './auth/auth.module';
import { DiaryModule } from './modules/diary/diary.module';
import { ProjectModule } from './modules/project/project.module';
import { TagModule } from './modules/tag/tag.module';
import { ResumeModule } from './modules/resume/resume.module';
import { ChangelogModule } from './modules/changelog/changelog.module';
import { CommentModule } from './modules/comment/comment.module';
import { RoleModule } from './modules/role/role.module';
import { MenuModule } from './modules/menu/menu.module';
import { MiniappModule } from './modules/miniapp/miniapp.module';
import { MiniToolModule } from './modules/minitool/minitool.module';

const appEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${appEnv}`, '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        timezone: '+08:00',
        charset: 'utf8mb4',
        // entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([CountToken]),
    ArticleModule,
    UserModule,
    ClassifyModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/uploads/resume/files/(.*)'],
    }),
    TasksModule,
    FriendShipModule,
    DiaryModule,
    ProjectModule,
    TagModule,
    ResumeModule,
    ChangelogModule,
    CommentModule,
    RoleModule,
    MenuModule,
    MiniappModule,
    MiniToolModule,
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
