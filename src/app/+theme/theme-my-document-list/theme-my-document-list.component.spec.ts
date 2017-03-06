import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeMyDocumentListComponent } from './theme-my-document-list.component';

describe('ThemeMyDocumentListComponent', () => {
  let component: ThemeMyDocumentListComponent;
  let fixture: ComponentFixture<ThemeMyDocumentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeMyDocumentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeMyDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
