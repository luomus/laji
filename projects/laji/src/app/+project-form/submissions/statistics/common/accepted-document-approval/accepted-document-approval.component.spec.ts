import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptedDocumentApprovalComponent } from './accepted-document-approval.component';

describe('AcceptedDocumentApprovalComponent', () => {
  let component: AcceptedDocumentApprovalComponent;
  let fixture: ComponentFixture<AcceptedDocumentApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptedDocumentApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptedDocumentApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
