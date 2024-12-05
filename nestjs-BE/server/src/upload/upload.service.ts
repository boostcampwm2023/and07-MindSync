import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(image: Express.Multer.File) {
    const params = {
      Bucket: this.configService.get<string>('S3_BUCKET_NAME'),
      Key: `${uuid()}-${image.originalname}`,
      Body: image.buffer,
    };
    await this.s3Client.send(new PutObjectCommand(params));
    const publicUrl = `https://${
      params.Bucket
    }.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${
      params.Key
    }`;
    return publicUrl;
  }
}
