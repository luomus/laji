import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcRoutesResultComponent } from './wbc-routes-result.component';

describe('WbcRoutesResultComponent', () => {
  let component: WbcRoutesResultComponent;
  let fixture: ComponentFixture<WbcRoutesResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcRoutesResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcRoutesResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
