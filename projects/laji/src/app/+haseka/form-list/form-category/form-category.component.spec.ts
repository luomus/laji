import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormCategoryComponent } from './form-category.component';

describe('FormCategoryComponent', () => {
  let component: FormCategoryComponent;
  let fixture: ComponentFixture<FormCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
