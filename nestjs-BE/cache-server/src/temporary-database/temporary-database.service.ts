import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { promises as fs } from 'fs';
import { join } from 'path';

interface OperationData {
  service: string;
  uniqueKey: string;
  command: string;
  data: any;
}

@Injectable()
export class TemporaryDatabaseService {
  private database: Map<string, Map<string, Map<string, any>>> = new Map();
  private userProfilesMap: Map<string, string[]> = new Map();
  private readonly FOLDER_NAME = 'operations';

  constructor(private readonly prisma: PrismaService) {
    this.initializeDatabase();
    this.readDataFromFiles();
  }

  private initializeDatabase() {
    const services = ['USER_TB', 'PROFILE_TB', 'SPACE_TB', 'BOARD_TB'];
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

  create(service: string, uniqueKey: string, data: any) {
    this.operation({ service, uniqueKey, command: 'insert', data });
  }

  update(service: string, uniqueKey: string, data: any) {
    this.operation({ service, uniqueKey, command: 'update', data });
  }

  remove(service: string, uniqueKey: string, data: any) {
    this.operation({ service, uniqueKey, command: 'delete', data });
  }

  delete(service: string, uniqueKey: string, command: string) {
    this.database.get(service).get(command).delete(uniqueKey);
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
      await this.performInsert(service, serviceMap.get('insert'));
      await this.performUpdate(service, serviceMap.get('update'));
      await this.performDelete(service, serviceMap.get('delete'));
    }
  }

  private async performInsert(service: string, dataMap: Map<string, any>) {
    const data = this.prepareData(service, 'insert', dataMap);
    this.userProfilesMap.clear();
    if (!data.length) return;
    await this.prisma[service].createMany({
      data: data,
      skipDuplicates: true,
    });
  }

  private async performUpdate(service: string, dataMap: Map<string, any>) {
    const data = this.prepareData(service, 'update', dataMap);
    if (!data.length) return;
    await Promise.all(
      data.map((item) => {
        const keyField = item.field;
        const keyValue = item.value[keyField];
        return this.prisma[service].update({
          where: { [keyField]: keyValue },
          data: item.value,
        });
      }),
    );
  }

  private async performDelete(service: string, dataMap: Map<string, any>) {
    const data = this.prepareData(service, 'delete', dataMap);
    if (!data.length) return;
    await Promise.all(
      data.map(async (item) => {
        try {
          return this.prisma[service].delete({
            where: { [item.field]: item.value },
          });
        } catch (error) {
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

  getUserProfiles(user_id: string): string[] {
    return this.userProfilesMap.get(user_id) || [];
  }

  addUserProfile(user_id: string, profile_uuid: string): void {
    const profiles = this.getUserProfiles(user_id);
    profiles.push(profile_uuid);
    this.userProfilesMap.set(user_id, profiles);
  }

  removeUserProfile(user_id: string, profile_uuid: string): void {
    const profiles = this.getUserProfiles(user_id);
    const index = profiles.indexOf(profile_uuid);
    if (index > -1) {
      profiles.splice(index, 1);
      this.userProfilesMap.set(user_id, profiles);
    }
  }
}
