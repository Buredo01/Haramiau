import { TestBed } from '@angular/core/testing';

import { CurrentWordService } from './current-word.service';

describe('CurrentWordService', () => {
  let service: CurrentWordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentWordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
