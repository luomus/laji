import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationTableComponent } from './observation-table.component';

describe('ObservationTableComponent', () => {
  let component: ObservationTableComponent;
  let fixture: ComponentFixture<ObservationTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
