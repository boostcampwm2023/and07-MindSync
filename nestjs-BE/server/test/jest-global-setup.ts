import { MongoDBContainer } from '@testcontainers/mongodb';
import { LocalstackContainer } from '@testcontainers/localstack';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';

export default async function () {
  const mongoDBContainer = await new MongoDBContainer()
    .withExposedPorts({ host: 27019, container: 27017 })
    .start();

  const localStackContainer = await new LocalstackContainer()
    .withExposedPorts({ host: 4566, container: 4566 })
    .start();

  const client = new S3Client({
    endpoint: 'http://localhost:4566',
    forcePathStyle: true,
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });
  const createBucketCommand = new CreateBucketCommand({
    Bucket: 'test-bucket',
  });
  await client.send(createBucketCommand);
  client.destroy();

  globalThis.mongodb = mongoDBContainer;
  globalThis.localstack = localStackContainer;
}
