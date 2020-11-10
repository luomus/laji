import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterAnnotationComponent } from './letter-annotation.component';

describe('KerttuLetterAnnotationComponent', () => {
  let component: LetterAnnotationComponent;
  let fixture: ComponentFixture<LetterAnnotationComponent>;

  beforeEach(async(() => {
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
