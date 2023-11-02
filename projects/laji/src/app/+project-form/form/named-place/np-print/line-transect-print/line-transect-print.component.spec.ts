import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineTransectPrintComponent } from './line-transect-print.component';

describe('LineTransectPrintComponent', () => {
  let component: LineTransectPrintComponent;
  let fixture: ComponentFixture<LineTransectPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineTransectPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineTransectPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
