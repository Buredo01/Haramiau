import { TestBed } from '@angular/core/testing';

import { EmoteService } from './emote.service';

describe('EmoteService', () => {
  let service: EmoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
