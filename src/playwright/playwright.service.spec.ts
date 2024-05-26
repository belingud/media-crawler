import { Test, TestingModule } from '@nestjs/testing';
import { PlayrightService } from './playwright.service';

describe('PlayrightService', () => {
  let service: PlayrightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayrightService],
    }).compile();

    service = module.get<PlayrightService>(PlayrightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
