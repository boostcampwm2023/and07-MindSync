import { Injectable } from '@nestjs/common';
import customEnv from '../config/env';
import { S3, Endpoint } from 'aws-sdk';
import uuid from '../utils/uuid';
const {
  NCLOUD_ACCESS_KEY,
  NCLOUD_SECRET_KEY,
  NCLOUD_REGION,
  STORAGE_URL,
  BUCKET_NAME,
} = customEnv;
const endpoint = new Endpoint(STORAGE_URL);

@Injectable()
export class UploadService {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      endpoint: endpoint,
      region: NCLOUD_REGION,
      credentials: {
        accessKeyId: NCLOUD_ACCESS_KEY,
        secretAccessKey: NCLOUD_SECRET_KEY,
      },
    });
  }

  async uploadFile(image: Express.Multer.File) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${uuid()}-${image.originalname}`,
      Body: image.buffer,
      ACL: 'public-read',
    };
    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }
}
