import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingAnnotationComponent } from './recording-annotation.component';

describe('KerttuRecordingAnnotationComponent', () => {
  let component: RecordingAnnotationComponent;
  let fixture: ComponentFixture<RecordingAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordingAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
