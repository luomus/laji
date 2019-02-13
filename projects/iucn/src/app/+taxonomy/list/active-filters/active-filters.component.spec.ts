import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveFiltersComponent } from './active-filters.component';

describe('ActiveFiltersComponent', () => {
  let component: ActiveFiltersComponent;
  let fixture: ComponentFixture<ActiveFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
