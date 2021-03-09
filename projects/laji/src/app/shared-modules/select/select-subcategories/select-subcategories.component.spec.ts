import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSubcategoriesComponent } from './select-subcategories.component';

describe('SelectSubcategoriesComponent', () => {
  let component: SelectSubcategoriesComponent;
  let fixture: ComponentFixture<SelectSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectSubcategoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
