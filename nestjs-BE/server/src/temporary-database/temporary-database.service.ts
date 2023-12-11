import { Injectable } from '@nestjs/common';
import {
  PrismaServiceMySQL,
  PrismaServiceMongoDB,
} from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import { join } from 'path';
import { TokenData } from 'src/auth/auth.service';
import { InviteCodeData } from 'src/invite-codes/invite-codes.service';
import { CreateProfileSpaceDto } from 'src/profile-space/dto/create-profile-space.dto';
import { UpdateProfileDto } from 'src/profiles/dto/update-profile.dto';
import { UpdateSpaceDto } from 'src/spaces/dto/update-space.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

type DeleteDataType = {
  field: string;
  value: string;
};

type InsertDataType =
  | TokenData
  | InviteCodeData
  | CreateProfileSpaceDto
  | UpdateProfileDto
  | UpdateSpaceDto
  | UpdateUserDto;

type UpdateDataType = {
  field: string;
  value: InsertDataType;
};
type DataType = InsertDataType | UpdateDataType | DeleteDataType;

interface OperationData {
  service: string;
  uniqueKey: string;
  command: string;
  data: DataType;
}

@Injectable()
export class TemporaryDatabaseService {
  private database: Map<string, Map<string, Map<string, DataType>>> = new Map();
  private readonly FOLDER_NAME = 'operations';

  constructor(
    private readonly prismaMysql: PrismaServiceMySQL,
    private readonly prismaMongoDB: PrismaServiceMongoDB,
  ) {
    this.initializeDatabase();
    this.readDataFromFiles();
    this.executeBulkOperations();
  }

  private initializeDatabase() {
    const services = [
      'USER_TB',
      'PROFILE_TB',
      'SPACE_TB',
      'BoardCollection',
      'PROFILE_SPACE_TB',
      'REFRESH_TOKEN_TB',
      'INVITE_CODE_TB',
    ];
    const operations = ['insert', 'update', 'delete'];

    services.forEach((service) => {
      const serviceMap = new Map();
      this.database.set(service, serviceMap);
      operations.forEach((operation) => {
        serviceMap.set(operation, new Map());
      });
    });
  }

  private async readDataFromFiles() {
    const files = await fs.readdir(this.FOLDER_NAME);
    files.forEach((file) => {
      if (file.endsWith('.csv')) {
        this.readDataFromFile(file);
      }
    });
  }

  private async readDataFromFile(file: string) {
    const [service, commandWithExtension] = file.split('-');
    const command = commandWithExtension.replace('.csv', '');
    const fileData = await fs.readFile(join(this.FOLDER_NAME, file), 'utf8');
    fileData.split('\n').forEach((line) => {
      if (line.trim() !== '') {
        const [uniqueKey, ...dataParts] = line.split(',');
        const data = dataParts.join(',');
        this.database
          .get(service)
          .get(command)
          .set(uniqueKey, JSON.parse(data));
      }
    });
  }

  get(service: string, uniqueKey: string, command: string): any {
    return this.database.get(service).get(command).get(uniqueKey);
  }

  create(service: string, uniqueKey: string, data: InsertDataType) {
    this.operation({ service, uniqueKey, command: 'insert', data });
  }

  update(service: string, uniqueKey: string, data: UpdateDataType) {
    this.operation({ service, uniqueKey, command: 'update', data });
  }

  remove(service: string, uniqueKey: string, data: DeleteDataType) {
    this.operation({ service, uniqueKey, command: 'delete', data });
  }

  delete(service: string, uniqueKey: string, command: string) {
    this.database.get(service).get(command).delete(uniqueKey);
    const filePath = join(this.FOLDER_NAME, `${service}-${command}.csv`);
    fs.readFile(filePath, 'utf8').then((fileData) => {
      const lines = fileData.split('\n');
      const updatedFileData = lines
        .filter((line) => !line.startsWith(`${uniqueKey},`))
        .join('\n');
      fs.writeFile(filePath, updatedFileData);
    });
  }

  operation({ service, uniqueKey, command, data }: OperationData) {
    const filePath = join(this.FOLDER_NAME, `${service}-${command}.csv`);
    fs.readFile(filePath, 'utf8').then((fileData) => {
      fileData += `${uniqueKey},${JSON.stringify(data)}\n`;
      fs.writeFile(filePath, fileData);
      this.database.get(service).get(command).set(uniqueKey, data);
    });
  }

  @Cron('0 */10 * * * *')
  async executeBulkOperations() {
    for (const service of this.database.keys()) {
      const serviceMap = this.database.get(service);
      const prisma =
        service === 'BoardCollection' ? this.prismaMongoDB : this.prismaMysql;
      await this.performInsert(service, serviceMap.get('insert'), prisma);
      await this.performUpdate(service, serviceMap.get('update'), prisma);
      await this.performDelete(service, serviceMap.get('delete'), prisma);
    }
  }

  private async performInsert(
    service: string,
    dataMap: Map<string, DataType>,
    prisma: PrismaServiceMongoDB | PrismaServiceMySQL,
  ) {
    const data = this.prepareData(service, 'insert', dataMap);
    if (!data.length) return;
    if (prisma instanceof PrismaServiceMySQL) {
      await prisma[service].createMany({
        data: data,
        skipDuplicates: true,
      });
    } else {
      await prisma[service].createMany({
        data: data,
      });
    }
  }

  private async performUpdate(
    service: string,
    dataMap: Map<string, DataType>,
    prisma: PrismaServiceMongoDB | PrismaServiceMySQL,
  ) {
    const data = this.prepareData(service, 'update', dataMap);
    if (!data.length) return;
    await Promise.all(
      data.map((item) => {
        const keyField = item.field;
        const keyValue = item.value[keyField];
        const updatedValue = Object.fromEntries(
          Object.entries(item.value).filter(([key]) => key !== 'uuid'),
        );
        return prisma[service].update({
          where: { [keyField]: keyValue },
          data: updatedValue,
        });
      }),
    );
  }

  private async performDelete(
    service: string,
    dataMap: Map<string, DataType>,
    prisma: PrismaServiceMongoDB | PrismaServiceMySQL,
  ) {
    const data = this.prepareData(service, 'delete', dataMap);
    if (!data.length) return;
    await Promise.all(
      data.map(async (item) => {
        try {
          await prisma[service].delete({
            where: { [item.field]: item.value },
          });
        } finally {
          return;
        }
      }),
    );
  }

  private prepareData(
    service: string,
    operation: string,
    dataMap: Map<string, any>,
  ) {
    const data = Array.from(dataMap.values());
    this.clearFile(`${service}-${operation}.csv`);
    dataMap.clear();
    return data;
  }

  private clearFile(filename: string) {
    fs.writeFile(join(this.FOLDER_NAME, filename), '', 'utf8');
  }
}
