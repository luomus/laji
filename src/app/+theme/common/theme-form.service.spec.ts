import { TestBed } from '@angular/core/testing';

import { ThemeFormService } from './theme-form.service';

describe('ThemeFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThemeFormService = TestBed.get(ThemeFormService);
    expect(service).toBeTruthy();
  });
});
