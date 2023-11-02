import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatatableHeaderComponent } from './datatable-header.component';

describe('DatatableHeaderComponent', () => {
  let component: DatatableHeaderComponent;
  let fixture: ComponentFixture<DatatableHeaderComponent>;

  beforeEach(waitForAsync(() => {
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
