import { TestBed, inject } from '@angular/core/testing';

import { QualityService } from './quality.service';

describe('QualityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QualityService]
    });
  });

  it('should be created', inject([QualityService], (service: QualityService) => {
    expect(service).toBeTruthy();
  }));
});
