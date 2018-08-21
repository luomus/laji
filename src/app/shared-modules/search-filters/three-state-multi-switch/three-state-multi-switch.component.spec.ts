import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeStateMultiSwitchComponent } from './three-state-multi-switch.component';

describe('ThreeStateMultiSwitchComponent', () => {
  let component: ThreeStateMultiSwitchComponent;
  let fixture: ComponentFixture<ThreeStateMultiSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeStateMultiSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeStateMultiSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
