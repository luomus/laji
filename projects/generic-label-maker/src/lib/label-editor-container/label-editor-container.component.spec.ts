import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelEditorContainerComponent } from './label-editor-container.component';

describe('LabelEditorContainerComponent', () => {
  let component: LabelEditorContainerComponent;
  let fixture: ComponentFixture<LabelEditorContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelEditorContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelEditorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
