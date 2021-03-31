import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HasekaFeedbackComponent } from './haseka-feedback.component';

describe('HasekaFeedbackComponent', () => {
  let component: HasekaFeedbackComponent;
  let fixture: ComponentFixture<HasekaFeedbackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HasekaFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HasekaFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
