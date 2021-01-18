import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KerttuLetterAnnotationComponent } from './kerttu-letter-annotation.component';

describe('KerttuLetterAnnotationViewComponent', () => {
  let component: KerttuLetterAnnotationComponent;
  let fixture: ComponentFixture<KerttuLetterAnnotationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuLetterAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuLetterAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
