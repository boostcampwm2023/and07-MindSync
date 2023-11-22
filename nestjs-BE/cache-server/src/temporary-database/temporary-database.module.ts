import { Global, Module } from '@nestjs/common';
import { TemporaryDatabaseService } from './temporary-database.service';

@Global()
@Module({
  providers: [TemporaryDatabaseService],
  exports: [TemporaryDatabaseService],
})
export class TemporaryDatabaseModule {}
