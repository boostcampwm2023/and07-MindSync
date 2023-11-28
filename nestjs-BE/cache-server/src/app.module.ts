import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TemporaryDatabaseModule } from './temporary-database/temporary-database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfilesModule } from './profiles/profiles.module';
import { SpacesModule } from './spaces/spaces.module';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    TemporaryDatabaseModule,
    ScheduleModule.forRoot(),
    ProfilesModule,
    SpacesModule,
    BoardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
