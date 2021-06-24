import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectrogramChartComponent } from './spectrogram-chart.component';

describe('SpectrogramChartComponent', () => {
  let component: SpectrogramChartComponent;
  let fixture: ComponentFixture<SpectrogramChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpectrogramChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrogramChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
