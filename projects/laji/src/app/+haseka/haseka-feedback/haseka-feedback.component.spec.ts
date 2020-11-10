import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HasekaFeedbackComponent } from './haseka-feedback.component';

describe('HasekaFeedbackComponent', () => {
  let component: HasekaFeedbackComponent;
  let fixture: ComponentFixture<HasekaFeedbackComponent>;

  beforeEach(async(() => {
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
