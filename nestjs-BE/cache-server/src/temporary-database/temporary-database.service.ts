import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
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
  private readonly FOLDER_NAME = 'operations';

  constructor(private readonly prisma: PrismaService) {
    this.initializeDatabase();
    this.readDataFromFiles();
  }

  private initializeDatabase() {
    const services = ['user', 'space', 'board'];
    const operations = ['insert', 'update', 'delete'];

    services.forEach((service) => {
      const serviceMap = new Map();
      this.database.set(service, serviceMap);
      operations.forEach((operation) => {
        serviceMap.set(operation, new Map());
      });
    });
  }

  private readDataFromFiles() {
    const files = readdirSync(this.FOLDER_NAME);
    files.forEach((file) => {
      if (file.endsWith('.csv')) {
        this.readDataFromFile(file);
      }
    });
  }

  private readDataFromFile(file: string) {
    const [service, commandWithExtension] = file.split('-');
    const command = commandWithExtension.replace('.csv', '');
    const fileData = readFileSync(join(this.FOLDER_NAME, file), 'utf8');
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
    let fileData = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
    fileData += `${uniqueKey},${JSON.stringify(data)}\n`;
    writeFileSync(filePath, fileData);
    this.database.get(service).get(command).set(uniqueKey, data);
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
        const existing = await this.prisma[service].findUnique({
          where: { [item.field]: item.value },
        });
        if (existing) {
          return this.prisma[service].delete({
            where: { [item.field]: item.value },
          });
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
    writeFileSync(join(this.FOLDER_NAME, filename), '', 'utf8');
  }
}
