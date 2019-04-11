import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonYearChartComponent } from './taxon-year-chart.component';

describe('ObservationYearGraphComponent', () => {
  let component: TaxonYearChartComponent;
  let fixture: ComponentFixture<TaxonYearChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonYearChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonYearChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
