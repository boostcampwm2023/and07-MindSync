import type { StartedLocalStackContainer } from '@testcontainers/localstack';
import type { StartedMongoDBContainer } from '@testcontainers/mongodb';
import type { StartedMySqlContainer } from '@testcontainers/mysql';

type ContainerMap = {
  mongodb?: StartedMongoDBContainer;
  localstack?: StartedLocalStackContainer;
  mysql?: StartedMySqlContainer;
};

export const containers: ContainerMap = {};
