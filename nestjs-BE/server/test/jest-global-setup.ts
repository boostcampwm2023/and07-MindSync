import { MongoDBContainer } from '@testcontainers/mongodb';

export default async function () {
  const mongoDBContainer = await new MongoDBContainer()
    .withExposedPorts({ host: 27019, container: 27017 })
    .start();

  globalThis.mongodb = mongoDBContainer;
}
