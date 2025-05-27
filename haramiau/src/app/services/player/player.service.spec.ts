import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { Database } from '@angular/fire/database';

describe('PlayerService', () => {
  let service: PlayerService;

  const mockDatabase = {} as Database;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlayerService,
        { provide: Database, useValue: mockDatabase }
      ]
    });

    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
