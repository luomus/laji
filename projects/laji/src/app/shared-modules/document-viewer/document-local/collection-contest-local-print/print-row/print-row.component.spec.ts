import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintRowComponent } from './print-row.component';

describe('PrintRowComponent', () => {
  let component: PrintRowComponent;
  let fixture: ComponentFixture<PrintRowComponent>;

  beforeEach(async(() => {
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
