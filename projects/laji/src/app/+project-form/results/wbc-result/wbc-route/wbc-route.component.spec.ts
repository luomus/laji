import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcRouteComponent } from './wbc-route.component';

describe('WbcRouteComponent', () => {
  let component: WbcRouteComponent;
  let fixture: ComponentFixture<WbcRouteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
