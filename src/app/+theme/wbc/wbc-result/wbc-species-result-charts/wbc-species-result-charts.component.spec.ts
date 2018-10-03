import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultChartsComponent } from './wbc-species-result-charts.component';

describe('WbcSpeciesResultsChartsComponent', () => {
  let component: WbcSpeciesResultChartsComponent;
  let fixture: ComponentFixture<WbcSpeciesResultChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
