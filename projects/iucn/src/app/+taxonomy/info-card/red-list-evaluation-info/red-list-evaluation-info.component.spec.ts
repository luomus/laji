import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedListEvaluationInfoComponent } from './red-list-evaluation-info.component';

describe('RedListEvaluationInfoComponent', () => {
  let component: RedListEvaluationInfoComponent;
  let fixture: ComponentFixture<RedListEvaluationInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListEvaluationInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListEvaluationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
