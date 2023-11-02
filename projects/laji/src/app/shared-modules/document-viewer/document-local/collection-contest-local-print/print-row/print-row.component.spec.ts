import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrintRowComponent } from './print-row.component';

describe('PrintRowComponent', () => {
  let component: PrintRowComponent;
  let fixture: ComponentFixture<PrintRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
