import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationYearChartComponent } from './observation-year-chart.component';

describe('ObservationYearGraphComponent', () => {
  let component: ObservationYearChartComponent;
  let fixture: ComponentFixture<ObservationYearChartComponent>;

  beforeEach(async(() => {
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
