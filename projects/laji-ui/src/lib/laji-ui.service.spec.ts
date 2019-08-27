import { TestBed } from '@angular/core/testing';

import { LajiUiService } from './laji-ui.service';

describe('LajiUiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LajiUiService = TestBed.get(LajiUiService);
    expect(service).toBeTruthy();
  });
});
