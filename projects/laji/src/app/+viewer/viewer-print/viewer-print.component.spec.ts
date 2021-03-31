import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewerPrintComponent } from './viewer-print.component';

describe('ViewerPrintComponent', () => {
  let component: ViewerPrintComponent;
  let fixture: ComponentFixture<ViewerPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
