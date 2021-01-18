import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentLocalViewerViewComponent } from './document-local-viewer-view.component';

describe('DocumentLocalViewComponent', () => {
  let component: DocumentLocalViewerViewComponent;
  let fixture: ComponentFixture<DocumentLocalViewerViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLocalViewerViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLocalViewerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
