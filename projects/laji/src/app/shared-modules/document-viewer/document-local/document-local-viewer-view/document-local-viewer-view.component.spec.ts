import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLocalViewerViewComponent } from './document-local-viewer-view.component';

describe('DocumentLocalViewComponent', () => {
  let component: DocumentLocalViewerViewComponent;
  let fixture: ComponentFixture<DocumentLocalViewerViewComponent>;

  beforeEach(async(() => {
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
