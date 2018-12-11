import { TestBed } from '@angular/core/testing';

import { GenericLabelMakerService } from './generic-label-maker.service';

describe('GenericLabelMakerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenericLabelMakerService = TestBed.get(GenericLabelMakerService);
    expect(service).toBeTruthy();
  });
});
