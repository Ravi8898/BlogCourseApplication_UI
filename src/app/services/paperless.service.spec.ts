import { TestBed } from '@angular/core/testing';

import { PaperlessService } from './paperless.service';

describe('PaperlessService', () => {
  let service: PaperlessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaperlessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
