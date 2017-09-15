import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsDatatableComponent } from './observations-datatable.component';

describe('ObservationsDatatableComponent', () => {
  let component: ObservationsDatatableComponent;
  let fixture: ComponentFixture<ObservationsDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationsDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
