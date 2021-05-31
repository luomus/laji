import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectResultFiltersComponent } from './syke-insect-result-filters.component';

describe('SykeInsectResultFiltersComponent', () => {
  let component: SykeInsectResultFiltersComponent;
  let fixture: ComponentFixture<SykeInsectResultFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectResultFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectResultFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
