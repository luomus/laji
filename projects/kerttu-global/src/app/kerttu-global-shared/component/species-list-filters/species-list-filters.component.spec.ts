import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesListFiltersComponent } from './species-list-filters.component';

describe('SpeciesListFiltersComponent', () => {
  let component: SpeciesListFiltersComponent;
  let fixture: ComponentFixture<SpeciesListFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeciesListFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesListFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
