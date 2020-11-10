import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPrintComponent } from './document-print.component';

describe('DocumentPrintComponent', () => {
  let component: DocumentPrintComponent;
  let fixture: ComponentFixture<DocumentPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
