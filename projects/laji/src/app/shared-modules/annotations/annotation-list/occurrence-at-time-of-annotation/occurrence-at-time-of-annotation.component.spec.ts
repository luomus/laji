import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceAtTimeOfAnnotationComponent } from './occurrence-at-time-of-annotation.component';

describe('OccurrenceAtTimeOfAnnotationComponent', () => {
  let component: OccurrenceAtTimeOfAnnotationComponent;
  let fixture: ComponentFixture<OccurrenceAtTimeOfAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceAtTimeOfAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceAtTimeOfAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
