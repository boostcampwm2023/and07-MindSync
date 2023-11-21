import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemporaryDatabaseModule } from './temporary-database/temporary-database.module';

@Module({
  imports: [TemporaryDatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
