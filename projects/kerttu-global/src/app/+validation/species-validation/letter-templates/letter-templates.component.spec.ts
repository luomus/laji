import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterTemplatesComponent } from './letter-templates.component';

describe('LetterTemplatesComponent', () => {
  let component: LetterTemplatesComponent;
  let fixture: ComponentFixture<LetterTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LetterTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
