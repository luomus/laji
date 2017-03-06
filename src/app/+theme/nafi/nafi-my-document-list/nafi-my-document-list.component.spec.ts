import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiMyDocumentListComponent } from './nafi-my-document-list.component';

describe('NafiMyDocumentListComponent', () => {
  let component: NafiMyDocumentListComponent;
  let fixture: ComponentFixture<NafiMyDocumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiMyDocumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiMyDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
