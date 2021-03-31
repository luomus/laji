import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcCensusesComponent } from './wbc-censuses.component';

describe('WbcCensusesComponent', () => {
  let component: WbcCensusesComponent;
  let fixture: ComponentFixture<WbcCensusesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcCensusesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcCensusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
