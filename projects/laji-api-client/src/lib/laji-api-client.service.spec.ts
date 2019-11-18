import { TestBed } from '@angular/core/testing';

import { LajiApiClientService } from './laji-api-client.service';

describe('LajiApiClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LajiApiClientService = TestBed.get(LajiApiClientService);
    expect(service).toBeTruthy();
  });
});
