import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SpacesModule } from './spaces/spaces.module';
import { BoardsModule } from './boards/boards.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { InviteCodesModule } from './invite-codes/invite-codes.module';
import { ProfileSpaceModule } from './profile-space/profile-space.module';
import { BoardTreesModule } from './board-trees/board-trees.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ScheduleModule.forRoot(),
    ProfilesModule,
    SpacesModule,
    BoardsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_DATABASE_URI'),
      }),
    }),
    InviteCodesModule,
    ProfileSpaceModule,
    BoardTreesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
