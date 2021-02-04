import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcRoutesComponent } from './wbc-routes.component';

describe('WbcRoutesComponent', () => {
  let component: WbcRoutesComponent;
  let fixture: ComponentFixture<WbcRoutesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRoutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
