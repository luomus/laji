import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedListEvaluationOccurrencesComponent } from './red-list-evaluation-occurrences.component';

describe('RedListEvaluationOccurrencesComponent', () => {
  let component: RedListEvaluationOccurrencesComponent;
  let fixture: ComponentFixture<RedListEvaluationOccurrencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListEvaluationOccurrencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListEvaluationOccurrencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
