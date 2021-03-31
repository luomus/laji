import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelEditorComponent } from './label-editor.component';

describe('LabelEditorComponent', () => {
  let component: LabelEditorComponent;
  let fixture: ComponentFixture<LabelEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
