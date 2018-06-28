import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFormFooterComponent } from './document-form-footer.component';

describe('DocumentFormFooterComponent', () => {
  let component: DocumentFormFooterComponent;
  let fixture: ComponentFixture<DocumentFormFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentFormFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentFormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
