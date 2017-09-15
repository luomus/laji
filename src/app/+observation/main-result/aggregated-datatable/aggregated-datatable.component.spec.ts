import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatedDatatableComponent } from './aggregated-datatable.component';

describe('AggregatedDatatableComponent', () => {
  let component: AggregatedDatatableComponent;
  let fixture: ComponentFixture<AggregatedDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatedDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatedDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
