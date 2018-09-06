import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerPrintComponent } from './viewer-print.component';

describe('ViewerPrintComponent', () => {
  let component: ViewerPrintComponent;
  let fixture: ComponentFixture<ViewerPrintComponent>;

  beforeEach(async(() => {
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
