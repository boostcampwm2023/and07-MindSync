import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientMySQL } from '../../prisma/generated/mysql';
import { PrismaClient as PrismaClientMongoDB } from '../../prisma/generated/mongodb';

@Injectable()
export class PrismaServiceMySQL
  extends PrismaClientMySQL
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}

@Injectable()
export class PrismaServiceMongoDB
  extends PrismaClientMongoDB
  implements OnModuleInit
{
  async onModuleInit() {
    await this.$connect();
  }
}
