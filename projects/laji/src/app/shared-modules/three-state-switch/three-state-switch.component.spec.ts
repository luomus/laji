import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThreeStateSwitchComponent } from './three-state-switch.component';

describe('ThreeStateSwitchComponent', () => {
  let component: ThreeStateSwitchComponent;
  let fixture: ComponentFixture<ThreeStateSwitchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeStateSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeStateSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
