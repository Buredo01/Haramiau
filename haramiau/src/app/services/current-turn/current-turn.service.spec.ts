import { TestBed } from '@angular/core/testing';

import { CurrentTurnService } from './current-turn.service';

describe('CurrentTurnService', () => {
  let service: CurrentTurnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentTurnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
