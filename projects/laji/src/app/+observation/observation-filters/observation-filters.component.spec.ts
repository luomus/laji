import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationFiltersComponent } from './observation-filters.component';

describe('ObservationFiltersComponent', () => {
  let component: ObservationFiltersComponent;
  let fixture: ComponentFixture<ObservationFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
