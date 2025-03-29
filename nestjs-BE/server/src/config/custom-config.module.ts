import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.MODE === 'prod' ? '.env.production' : '.env.development',
      expandVariables: true,
    }),
  ],
})
export class CustomConfigModule {}
