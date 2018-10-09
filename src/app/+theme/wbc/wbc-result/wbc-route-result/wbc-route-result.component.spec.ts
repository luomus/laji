import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcRouteResultComponent } from './wbc-route-result.component';

describe('WbcRouteResultComponent', () => {
  let component: WbcRouteResultComponent;
  let fixture: ComponentFixture<WbcRouteResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRouteResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRouteResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
