import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationDataObservationComponent } from './annotation-data-observation.component';

describe('AnnotationDataObservationComponent', () => {
  let component: AnnotationDataObservationComponent;
  let fixture: ComponentFixture<AnnotationDataObservationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationDataObservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationDataObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
