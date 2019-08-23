import { TestBed } from '@angular/core/testing';

import { AnnotationListService } from './annotation-list.service';

describe('AnnotationListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnnotationListService = TestBed.get(AnnotationListService);
    expect(service).toBeTruthy();
  });
});
