import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableOwnSubmissionsComponent } from './datatable-own-submissions.component';

describe('DatatableOwnSubmissionsComponent', () => {
  let component: DatatableOwnSubmissionsComponent;
  let fixture: ComponentFixture<DatatableOwnSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableOwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableOwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
