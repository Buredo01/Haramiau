import { TestBed } from '@angular/core/testing';

import { GameMasterService } from './game-master.service';

describe('GameMasterService', () => {
  let service: GameMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
