import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcRoutesMapComponent } from './wbc-routes-map.component';

describe('WbcRoutesMapComponent', () => {
  let component: WbcRoutesMapComponent;
  let fixture: ComponentFixture<WbcRoutesMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRoutesMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRoutesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
