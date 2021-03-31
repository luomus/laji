import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationTableOwnDocumentsComponent } from './observation-table-own-documents.component';

describe('ObservationTableOwnDocumentsComponent', () => {
  let component: ObservationTableOwnDocumentsComponent;
  let fixture: ComponentFixture<ObservationTableOwnDocumentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationTableOwnDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationTableOwnDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
