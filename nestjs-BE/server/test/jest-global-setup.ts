import { MongoDBContainer } from '@testcontainers/mongodb';
import { LocalstackContainer } from '@testcontainers/localstack';
import { MySqlContainer } from '@testcontainers/mysql';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { containers } from './test-containers';

interface ProcessEnv {
  [key: string]: string | undefined;
}

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

async function createMongoDBConatiner(processEnv: ProcessEnv) {
  const mongoDBContainer = await new MongoDBContainer()
    .withExposedPorts({
      host: Number(processEnv.MONGODB_PORT),
      container: 27017,
    })
    .start();

  containers.mongodb = mongoDBContainer;
}

async function createLocalstackContainer(processEnv: ProcessEnv) {
  const localStackContainer = await new LocalstackContainer()
    .withExposedPorts({ host: Number(processEnv.S3_PORT), container: 4566 })
    .start();

  const client = new S3Client({
    endpoint: processEnv.S3_ENDPOINT,
    forcePathStyle: true,
    region: processEnv.AWS_REGION,
    credentials: {
      accessKeyId: processEnv.S3_ACCESS_KEY_ID,
      secretAccessKey: processEnv.S3_SECRET_ACCESS_KEY,
    },
  });
  const createBucketCommand = new CreateBucketCommand({
    Bucket: processEnv.S3_BUCKET_NAME,
  });
  await client.send(createBucketCommand);
  client.destroy();

  containers.localstack = localStackContainer;
}

async function createMysqlContainer(processEnv: ProcessEnv) {
  const mysqlContainer = await new MySqlContainer()
    .withExposedPorts({ host: Number(processEnv.MYSQL_PORT), container: 3306 })
    .withRootPassword(processEnv.MYSQL_ROOT_PASSWORD)
    .withDatabase(processEnv.MYSQL_DATABASE)
    .start();

  execSync('npx dotenv-cli -e .env.development -- prisma migrate dev', {
    stdio: 'inherit',
  });

  containers.mysql = mysqlContainer;
}
