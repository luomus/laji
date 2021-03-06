import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationFormNewComponent } from './annotation-form-new.component';

describe('AnnotationFormNewComponent', () => {
  let component: AnnotationFormNewComponent;
  let fixture: ComponentFixture<AnnotationFormNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationFormNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationFormNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
