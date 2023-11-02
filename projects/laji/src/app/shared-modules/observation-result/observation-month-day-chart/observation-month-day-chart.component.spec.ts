import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationMonthDayChartComponent } from './observation-month-day-chart.component';

describe('TaxonMonthDayChartComponent', () => {
  let component: ObservationMonthDayChartComponent;
  let fixture: ComponentFixture<ObservationMonthDayChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationMonthDayChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationMonthDayChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
