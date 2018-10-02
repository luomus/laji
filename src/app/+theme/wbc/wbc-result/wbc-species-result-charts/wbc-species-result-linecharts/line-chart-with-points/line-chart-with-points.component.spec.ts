import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartWithPointsComponent } from './line-chart-with-points.component';

describe('LineChartWithPointsComponent', () => {
  let component: LineChartWithPointsComponent;
  let fixture: ComponentFixture<LineChartWithPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartWithPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartWithPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
