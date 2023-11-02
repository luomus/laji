import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentLocalComponent } from './document-local.component';

describe('DocumentLocalComponent', () => {
  let component: DocumentLocalComponent;
  let fixture: ComponentFixture<DocumentLocalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
