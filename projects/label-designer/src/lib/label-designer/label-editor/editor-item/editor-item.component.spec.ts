import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditorItemComponent } from './editor-item.component';

describe('EditorItemComponent', () => {
  let component: EditorItemComponent;
  let fixture: ComponentFixture<EditorItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
