import { TestBed } from '@angular/core/testing';

import { HaramiauPlayerService } from './haramiau-player.service';

describe('HaramiauPlayerService', () => {
  let service: HaramiauPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HaramiauPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
