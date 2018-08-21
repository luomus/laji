import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeStateSwitchComponent } from './three-state-switch.component';

describe('ThreeStateSwitchComponent', () => {
  let component: ThreeStateSwitchComponent;
  let fixture: ComponentFixture<ThreeStateSwitchComponent>;

  beforeEach(async(() => {
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
