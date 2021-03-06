import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NpPrintComponent } from './np-print.component';

describe('NpPrintComponent', () => {
  let component: NpPrintComponent;
  let fixture: ComponentFixture<NpPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NpPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
