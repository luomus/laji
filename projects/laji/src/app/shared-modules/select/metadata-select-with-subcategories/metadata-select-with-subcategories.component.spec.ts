import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataSelectWithSubcategoriesComponent } from './metadata-select-with-subcategories.component';

describe('MetadataSelectWithSubcategoriesComponent', () => {
  let component: MetadataSelectWithSubcategoriesComponent;
  let fixture: ComponentFixture<MetadataSelectWithSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataSelectWithSubcategoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataSelectWithSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
