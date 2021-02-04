import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentFormFooterComponent } from './document-form-footer.component';

describe('DocumentFormFooterComponent', () => {
  let component: DocumentFormFooterComponent;
  let fixture: ComponentFixture<DocumentFormFooterComponent>;

  beforeEach(waitForAsync(() => {
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
