import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuRecordingAnnotationComponent } from './kerttu-recording-annotation.component';

describe('KerttuRecordingAnnotationViewComponent', () => {
  let component: KerttuRecordingAnnotationComponent;
  let fixture: ComponentFixture<KerttuRecordingAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuRecordingAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuRecordingAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
