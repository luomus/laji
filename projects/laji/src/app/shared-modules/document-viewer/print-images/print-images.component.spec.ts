import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrintImagesComponent } from './print-images.component';

describe('PrintImagesComponent', () => {
  let component: PrintImagesComponent;
  let fixture: ComponentFixture<PrintImagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
