import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelPrintComponent } from './label-print.component';

describe('LabelPrintComponent', () => {
  let component: LabelPrintComponent;
  let fixture: ComponentFixture<LabelPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
