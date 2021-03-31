import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormCategorySurveyComponent } from './form-category-survey.component';

describe('FormCategorySurveyComponent', () => {
  let component: FormCategorySurveyComponent;
  let fixture: ComponentFixture<FormCategorySurveyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCategorySurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCategorySurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
