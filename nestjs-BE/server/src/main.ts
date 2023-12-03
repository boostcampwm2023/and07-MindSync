import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import customEnv from 'config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(customEnv.SERVER_PORT);
}
bootstrap();
