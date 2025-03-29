import { containers } from './test-containers';

export default async function () {
  await containers.mongodb.stop();
  await containers.localstack.stop();
  await containers.mysql.stop();
}
