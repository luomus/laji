import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HasekaTermsComponent } from './haseka-terms.component';

describe('HasekaTermsComponent', () => {
  let component: HasekaTermsComponent;
  let fixture: ComponentFixture<HasekaTermsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HasekaTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HasekaTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
