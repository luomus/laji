import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelPageComponent } from './label-page.component';

describe('LabelPageComponent', () => {
  let component: LabelPageComponent;
  let fixture: ComponentFixture<LabelPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
