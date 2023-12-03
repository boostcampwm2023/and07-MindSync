import { Global, Module } from '@nestjs/common';
import { PrismaServiceMySQL } from './prisma.service';
import { PrismaServiceMongoDB } from './prisma.service';

@Global()
@Module({
  providers: [PrismaServiceMySQL, PrismaServiceMongoDB],
  exports: [PrismaServiceMySQL, PrismaServiceMongoDB],
})
export class PrismaModule {}
