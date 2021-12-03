import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationPieChartComponent } from './validation-pie-chart.component';

describe('ValidationPieChartComponent', () => {
  let component: ValidationPieChartComponent;
  let fixture: ComponentFixture<ValidationPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationPieChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
