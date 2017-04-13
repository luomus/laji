/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
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
