import { Test, TestingModule } from '@nestjs/testing';
import { TemporaryDatabaseService } from './temporary-database.service';

describe('TemporaryDatabaseService', () => {
  let service: TemporaryDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemporaryDatabaseService],
    }).compile();

    service = module.get<TemporaryDatabaseService>(TemporaryDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
