import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationYearChartComponent } from './observation-year-chart.component';

describe('ObservationYearGraphComponent', () => {
  let component: ObservationYearChartComponent;
  let fixture: ComponentFixture<ObservationYearChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationYearChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationYearChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
