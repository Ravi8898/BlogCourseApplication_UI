import { TestBed } from '@angular/core/testing';

import { BorderColorService } from './border-color.service';

describe('BorderColorService', () => {
  let service: BorderColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BorderColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
