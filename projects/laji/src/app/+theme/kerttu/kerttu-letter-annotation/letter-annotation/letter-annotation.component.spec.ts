import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LetterAnnotationComponent } from './letter-annotation.component';

describe('KerttuLetterAnnotationComponent', () => {
  let component: LetterAnnotationComponent;
  let fixture: ComponentFixture<LetterAnnotationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LetterAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
