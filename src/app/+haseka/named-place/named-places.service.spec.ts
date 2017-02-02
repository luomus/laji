/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NamedPlacesService } from './named-places.service';

describe('NamedPlacesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NamedPlacesService]
    });
  });

  it('should ...', inject([NamedPlacesService], (service: NamedPlacesService) => {
    expect(service).toBeTruthy();
  }));
});
