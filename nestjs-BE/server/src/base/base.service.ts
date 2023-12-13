import { HttpException, HttpStatus } from '@nestjs/common';
import {
  PrismaServiceMySQL,
  PrismaServiceMongoDB,
} from '../prisma/prisma.service';
import { TemporaryDatabaseService } from '../temporary-database/temporary-database.service';
import LRUCache from '../utils/lru-cache';
import generateUuid from '../utils/uuid';
import { ResponseUtils } from 'src/utils/response';

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

  async create(data: T, generateUuidFlag: boolean = true) {
    if (generateUuidFlag) data.uuid = generateUuid();
    const key = this.generateKey(data);
    const deleteCommand = this.temporaryDatabaseService.get(
      this.className,
      key,
      'delete',
    );
    if (deleteCommand) {
      this.temporaryDatabaseService.delete(this.className, key, 'delete');
    } else {
      const storeData = await this.getDataFromCacheOrDB(key);
      if (storeData) {
        throw new HttpException('Data already exists.', HttpStatus.CONFLICT);
      }
      this.temporaryDatabaseService.create(this.className, key, data);
    }
    this.cache.put(key, data);
    return ResponseUtils.createResponse(HttpStatus.CREATED, data);
  }

  async findOne(key: string) {
    const data = await this.getDataFromCacheOrDB(key);
    const deleteCommand = this.temporaryDatabaseService.get(
      this.className,
      key,
      'delete',
    );
    if (deleteCommand) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (data) {
      const mergedData = this.mergeWithUpdateCommand(data, key);
      this.cache.put(key, mergedData);
      return ResponseUtils.createResponse(HttpStatus.OK, mergedData);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
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
      return ResponseUtils.createResponse(HttpStatus.OK, updatedData.value);
    } else {
      return ResponseUtils.createResponse(HttpStatus.NOT_FOUND);
    }
  }

  async remove(key: string) {
    const storeData = await this.getDataFromCacheOrDB(key);
    if (!storeData) return ResponseUtils.createResponse(HttpStatus.NO_CONTENT);
    this.cache.delete(key);
    const insertTemporaryData = this.temporaryDatabaseService.get(
      this.className,
      key,
      'insert',
    );
    const updateTemporaryData = this.temporaryDatabaseService.get(
      this.className,
      key,
      'update',
    );
    if (updateTemporaryData) {
      this.temporaryDatabaseService.delete(this.className, key, 'update');
    }
    if (insertTemporaryData) {
      this.temporaryDatabaseService.delete(this.className, key, 'insert');
    } else {
      const value = key.includes('+') ? this.stringToObject(key) : key;
      this.temporaryDatabaseService.remove(this.className, key, {
        field: this.field,
        value,
      });
    }
    return ResponseUtils.createResponse(HttpStatus.NO_CONTENT);
  }

  async getDataFromCacheOrDB(key: string): Promise<T | null> {
    if (!key) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    const cacheData = this.cache.get(key);
    if (cacheData) return cacheData;
    const temporaryDatabaseData = this.temporaryDatabaseService.get(
      this.className,
      key,
      'insert',
    );
    if (temporaryDatabaseData) return temporaryDatabaseData;
    const databaseData = await this.prisma[this.className].findUnique({
      where: {
        [this.field]: key.includes('+') ? this.stringToObject(key) : key,
      },
    });
    return databaseData;
  }

  stringToObject(key: string) {
    const obj = {};
    const keyValuePairs = key.split('+');

    keyValuePairs.forEach((keyValue) => {
      const [key, value] = keyValue.split(':');
      obj[key] = value;
    });

    return obj;
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
