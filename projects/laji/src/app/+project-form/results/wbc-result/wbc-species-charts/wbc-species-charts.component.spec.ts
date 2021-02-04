import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcSpeciesChartsComponent } from './wbc-species-charts.component';

describe('WbcSpeciesResultsChartsComponent', () => {
  let component: WbcSpeciesChartsComponent;
  let fixture: ComponentFixture<WbcSpeciesChartsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
