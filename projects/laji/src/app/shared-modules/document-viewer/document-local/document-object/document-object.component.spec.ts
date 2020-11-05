import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentObjectComponent } from './document-object.component';

describe('DocumentObjectComponent', () => {
  let component: DocumentObjectComponent;
  let fixture: ComponentFixture<DocumentObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
