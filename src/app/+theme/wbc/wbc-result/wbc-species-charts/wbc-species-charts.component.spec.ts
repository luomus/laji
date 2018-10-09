import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesChartsComponent } from './wbc-species-charts.component';

describe('WbcSpeciesResultsChartsComponent', () => {
  let component: WbcSpeciesChartsComponent;
  let fixture: ComponentFixture<WbcSpeciesChartsComponent>;

  beforeEach(async(() => {
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
