import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelPreviewComponent } from './label-preview.component';

describe('LabelPreviewComponent', () => {
  let component: LabelPreviewComponent;
  let fixture: ComponentFixture<LabelPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
