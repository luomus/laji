import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitRowsComponent } from './unit-rows.component';

describe('UnitRowsComponent', () => {
  let component: UnitRowsComponent;
  let fixture: ComponentFixture<UnitRowsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
