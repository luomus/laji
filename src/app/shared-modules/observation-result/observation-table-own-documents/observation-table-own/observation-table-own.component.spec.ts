import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationTableOwnComponent } from './observation-table-own.component';

describe('ObservationTableOwnComponent', () => {
  let component: ObservationTableOwnComponent;
  let fixture: ComponentFixture<ObservationTableOwnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationTableOwnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationTableOwnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
