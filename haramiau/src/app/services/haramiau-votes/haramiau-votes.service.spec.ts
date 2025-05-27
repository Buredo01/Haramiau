import { TestBed } from '@angular/core/testing';

import { HaramiauVotesService } from './haramiau-votes.service';

describe('HaramiauVotesService', () => {
  let service: HaramiauVotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HaramiauVotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
