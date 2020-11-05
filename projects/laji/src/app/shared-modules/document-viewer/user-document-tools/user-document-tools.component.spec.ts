import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDocumentToolsComponent } from './user-document-tools.component';

describe('UserDocumentToolsComponent', () => {
  let component: UserDocumentToolsComponent;
  let fixture: ComponentFixture<UserDocumentToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDocumentToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDocumentToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
