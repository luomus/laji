import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableHeaderComponent } from './datatable-header.component';

describe('DatatableHeaderComponent', () => {
  let component: DatatableHeaderComponent;
  let fixture: ComponentFixture<DatatableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
