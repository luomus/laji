import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatatableOwnSubmissionsComponent } from './datatable-own-submissions.component';

describe('DatatableOwnSubmissionsComponent', () => {
  let component: DatatableOwnSubmissionsComponent;
  let fixture: ComponentFixture<DatatableOwnSubmissionsComponent>;

  beforeEach(waitForAsync(() => {
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
