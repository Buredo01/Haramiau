import { TestBed } from '@angular/core/testing';

import { EnddialogService } from './enddialog.service';

describe('EnddialogService', () => {
  let service: EnddialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnddialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
