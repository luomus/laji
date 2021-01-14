import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedListChartComponent } from './red-list-chart.component';

describe('RedListChartComponent', () => {
  let component: RedListChartComponent;
  let fixture: ComponentFixture<RedListChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
