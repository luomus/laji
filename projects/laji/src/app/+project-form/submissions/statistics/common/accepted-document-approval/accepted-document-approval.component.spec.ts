import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AcceptedDocumentApprovalComponent } from './accepted-document-approval.component';

describe('AcceptedDocumentApprovalComponent', () => {
  let component: AcceptedDocumentApprovalComponent;
  let fixture: ComponentFixture<AcceptedDocumentApprovalComponent>;

  beforeEach(waitForAsync(() => {
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
