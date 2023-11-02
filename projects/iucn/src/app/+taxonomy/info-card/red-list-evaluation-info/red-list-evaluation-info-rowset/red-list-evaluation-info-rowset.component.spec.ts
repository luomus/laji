import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedListEvaluationInfoRowsetComponent } from './red-list-evaluation-info-rowset.component';

describe('RedListEvaluationInfoRowsetComponent', () => {
  let component: RedListEvaluationInfoRowsetComponent;
  let fixture: ComponentFixture<RedListEvaluationInfoRowsetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListEvaluationInfoRowsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListEvaluationInfoRowsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
