import { TestBed } from '@angular/core/testing';

import { LabelService } from './label.service';

describe('LabelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LabelService = TestBed.get(LabelService);
    expect(service).toBeTruthy();
  });
});
