import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultsChartsComponent } from './wbc-species-result-charts.component';

describe('WbcSpeciesResultsChartsComponent', () => {
  let component: WbcSpeciesResultsChartsComponent;
  let fixture: ComponentFixture<WbcSpeciesResultsChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultsChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
