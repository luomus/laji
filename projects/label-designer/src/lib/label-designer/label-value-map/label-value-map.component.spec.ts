import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelValueMapComponent } from './label-value-map.component';

describe('LabelValueMapComponent', () => {
  let component: LabelValueMapComponent;
  let fixture: ComponentFixture<LabelValueMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelValueMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelValueMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
