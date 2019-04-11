import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonMonthDayChartComponent } from './taxon-month-day-chart.component';

describe('TaxonMonthDayChartComponent', () => {
  let component: TaxonMonthDayChartComponent;
  let fixture: ComponentFixture<TaxonMonthDayChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonMonthDayChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonMonthDayChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
