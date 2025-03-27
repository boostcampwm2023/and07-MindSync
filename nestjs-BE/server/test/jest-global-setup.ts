import { MongoDBContainer } from '@testcontainers/mongodb';
import { LocalstackContainer } from '@testcontainers/localstack';
import { MySqlContainer } from '@testcontainers/mysql';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

export default async function () {
  const processEnv = getProcessEnv();
  await createMongoDBConatiner(processEnv);
  await createLocalstackContainer(processEnv);
  await createMysqlContainer(processEnv);
}

function getProcessEnv() {
  const processEnv = {};
  const { error, parsed } = config({
    processEnv,
    path: './.env.development',
  });
  if (error) {
    throw error;
  }
  expand({ parsed, processEnv });
  return processEnv;
}

async function createMongoDBConatiner(processEnv) {
  const mongoDBContainer = await new MongoDBContainer()
    .withExposedPorts({ host: 27019, container: 27017 })
    .start();

  globalThis.mongodb = mongoDBContainer;
}

async function createLocalstackContainer(processEnv) {
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

  globalThis.localstack = localStackContainer;
}

async function createMysqlContainer(processEnv) {
  const mysqlContainer = await new MySqlContainer()
    .withExposedPorts({ host: 3306, container: 3306 })
    .withRootPassword('1234')
    .withDatabase('mindsync')
    .start();

  execSync('npx dotenv-cli -e .env.development -- prisma migrate dev', {
    stdio: 'inherit',
  });

  globalThis.mysql = mysqlContainer;
}
