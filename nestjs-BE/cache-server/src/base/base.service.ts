import { Injectable } from '@nestjs/common';
import {
  PrismaServiceMySQL,
  PrismaServiceMongoDB,
} from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import LRUCache from '../utils/lru-cache';
import generateUuid from '../utils/uuid';

interface BaseServiceOptions {
  prisma: PrismaServiceMySQL | PrismaServiceMongoDB;
  temporaryDatabaseService: TemporaryDatabaseService;
  cacheSize: number;
  className: string;
  field: string;
}

export interface HasUuid {
  uuid?: string;
}

@Injectable()
export abstract class BaseService<T extends HasUuid> {
  protected cache: LRUCache;
  protected className: string;
  protected field: string;
  protected prisma: PrismaServiceMySQL | PrismaServiceMongoDB;
  protected temporaryDatabaseService: TemporaryDatabaseService;

  constructor(options: BaseServiceOptions) {
    this.cache = new LRUCache(options.cacheSize);
    this.className = options.className;
    this.field = options.field;
    this.prisma = options.prisma;
    this.temporaryDatabaseService = options.temporaryDatabaseService;
  }

  abstract generateKey(data: T): string;

  async create(data: T): Promise<T | string> {
    data.uuid = generateUuid();
    const key = this.generateKey(data);
    const storeData = await this.getDataFromCacheOrDB(key);
    if (storeData) return 'Data already exists.';

    this.temporaryDatabaseService.create(this.className, key, data);
    this.cache.put(key, data);
    return data;
  }

  async findOne(key: string): Promise<T | null> {
    const data = await this.getDataFromCacheOrDB(key);
    const deleteCommand = this.temporaryDatabaseService.get(
      this.className,
      key,
      'delete',
    );
    if (deleteCommand) return null;
    if (data) {
      const mergedData = this.mergeWithUpdateCommand(data, key);
      this.cache.put(key, mergedData);
      return mergedData;
    }

    return data;
  }

  async update(key: string, updateData: T) {
    const data = await this.getDataFromCacheOrDB(key);
    if (data) {
      const updatedData = {
        field: this.field,
        value: { ...data, ...updateData },
      };
      if (this.temporaryDatabaseService.get(this.className, key, 'insert')) {
        this.temporaryDatabaseService.create(
          this.className,
          key,
          updatedData.value,
        );
      } else {
        this.temporaryDatabaseService.update(this.className, key, updatedData);
      }
      this.cache.put(key, updatedData.value);
    }
  }

  async remove(key: string) {
    this.cache.delete(key);
    const insertTemporaryData = this.temporaryDatabaseService.get(
      this.className,
      key,
      'insert',
    );
    if (insertTemporaryData) {
      this.temporaryDatabaseService.delete(this.className, key, 'insert');
    } else {
      this.temporaryDatabaseService.remove(this.className, key, {
        field: this.field,
        value: key,
      });
    }
  }

  async getDataFromCacheOrDB(key: string): Promise<T | null> {
    const cacheData = this.cache.get(key);
    if (cacheData) return cacheData;
    const temporaryDatabaseData = this.temporaryDatabaseService.get(
      this.className,
      key,
      'insert',
    );
    if (temporaryDatabaseData) return temporaryDatabaseData;
    const databaseData = await this.prisma[this.className].findUnique({
      where: { [this.field]: key },
    });
    return databaseData;
  }

  private mergeWithUpdateCommand(data: T, key: string): T {
    const updateCommand = this.temporaryDatabaseService.get(
      this.className,
      key,
      'update',
    );
    if (updateCommand) return { ...data, ...updateCommand.value };

    return data;
  }
}
