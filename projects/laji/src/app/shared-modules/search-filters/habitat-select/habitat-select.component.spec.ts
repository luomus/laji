import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitatSelectComponent } from './habitat-select.component';

describe('HabitatSelectComponent', () => {
  let component: HabitatSelectComponent;
  let fixture: ComponentFixture<HabitatSelectComponent>;

  beforeEach(async(() => {
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
