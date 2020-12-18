import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrintMapComponent } from './print-map.component';

describe('PrintMapComponent', () => {
  let component: PrintMapComponent;
  let fixture: ComponentFixture<PrintMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
