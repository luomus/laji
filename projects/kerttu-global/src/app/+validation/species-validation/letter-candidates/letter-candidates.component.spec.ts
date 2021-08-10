import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterCandidatesComponent } from './letter-candidates.component';

describe('LetterCandidatesComponent', () => {
  let component: LetterCandidatesComponent;
  let fixture: ComponentFixture<LetterCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LetterCandidatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
