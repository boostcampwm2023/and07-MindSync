import { DocumentBuilder } from '@nestjs/swagger';
export const swaggerConfig = new DocumentBuilder()
  .setTitle('mind-sync db-api')
  .setDescription('API description')
  .setVersion('1.0')
  .build();
