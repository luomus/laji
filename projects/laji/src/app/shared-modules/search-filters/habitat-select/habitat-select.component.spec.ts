import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HabitatSelectComponent } from './habitat-select.component';

describe('HabitatSelectComponent', () => {
  let component: HabitatSelectComponent;
  let fixture: ComponentFixture<HabitatSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HabitatSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitatSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
