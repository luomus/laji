import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentLocalPrintViewComponent } from './document-local-print-view.component';

describe('DocumentLocalPrintViewComponent', () => {
  let component: DocumentLocalPrintViewComponent;
  let fixture: ComponentFixture<DocumentLocalPrintViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLocalPrintViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLocalPrintViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
