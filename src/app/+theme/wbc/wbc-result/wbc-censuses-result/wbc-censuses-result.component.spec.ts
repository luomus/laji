import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcCensusesResultComponent } from './wbc-censuses-result.component';

describe('WbcCensusesResultComponent', () => {
  let component: WbcCensusesResultComponent;
  let fixture: ComponentFixture<WbcCensusesResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcCensusesResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcCensusesResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
