import { inject, TestBed } from '@angular/core/testing';

import { FormPermissionService } from './form-permission.service';

describe('FormPermissionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormPermissionService]
    });
  });

  it('should ...', inject([FormPermissionService], (service: FormPermissionService) => {
    expect(service).toBeTruthy();
  }));
});
