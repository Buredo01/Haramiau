import { TestBed } from '@angular/core/testing';

import { RandomwordService } from './randomword.service';

describe('RandomwordService', () => {
  let service: RandomwordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomwordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
