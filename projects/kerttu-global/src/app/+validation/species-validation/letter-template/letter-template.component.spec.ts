import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterTemplateComponent } from './letter-template.component';

describe('LetterTemplateComponent', () => {
  let component: LetterTemplateComponent;
  let fixture: ComponentFixture<LetterTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LetterTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
