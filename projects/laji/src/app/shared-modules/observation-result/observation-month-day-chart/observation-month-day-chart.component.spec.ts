import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationMonthDayChartComponent } from './observation-month-day-chart.component';

describe('TaxonMonthDayChartComponent', () => {
  let component: ObservationMonthDayChartComponent;
  let fixture: ComponentFixture<ObservationMonthDayChartComponent>;

  beforeEach(async(() => {
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
