import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuLetterAnnotationComponent } from './kerttu-letter-annotation.component';

describe('KerttuLetterAnnotationComponent', () => {
  let component: KerttuLetterAnnotationComponent;
  let fixture: ComponentFixture<KerttuLetterAnnotationComponent>;

  beforeEach(async(() => {
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
