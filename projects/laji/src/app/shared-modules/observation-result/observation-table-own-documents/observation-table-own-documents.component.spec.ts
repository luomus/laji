import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationTableOwnDocumentsComponent } from './observation-table-own-documents.component';

describe('ObservationTableOwnDocumentsComponent', () => {
  let component: ObservationTableOwnDocumentsComponent;
  let fixture: ComponentFixture<ObservationTableOwnDocumentsComponent>;

  beforeEach(async(() => {
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
