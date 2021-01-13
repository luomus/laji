import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineTransectChartComponent } from './line-transect-chart.component';

describe('LineTransectChartComponent', () => {
  let component: LineTransectChartComponent;
  let fixture: ComponentFixture<LineTransectChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineTransectChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineTransectChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
