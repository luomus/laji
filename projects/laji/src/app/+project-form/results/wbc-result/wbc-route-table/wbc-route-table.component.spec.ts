import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcRouteTableComponent } from './wbc-route-table.component';

describe('WbcRouteTableComponent', () => {
  let component: WbcRouteTableComponent;
  let fixture: ComponentFixture<WbcRouteTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRouteTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRouteTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
