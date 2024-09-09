import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import customEnv from '../config/env';
import uuid from '../utils/uuid';

const { AWS_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME } =
  customEnv;

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(image: Express.Multer.File) {
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `${uuid()}-${image.originalname}`,
      Body: image.buffer,
    };
    await this.s3Client.send(new PutObjectCommand(params));
    const publicUrl = `https://${S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${params.Key}`;
    return publicUrl;
  }
}
