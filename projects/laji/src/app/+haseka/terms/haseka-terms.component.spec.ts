import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HasekaTermsComponent } from './haseka-terms.component';

describe('HasekaTermsComponent', () => {
  let component: HasekaTermsComponent;
  let fixture: ComponentFixture<HasekaTermsComponent>;

  beforeEach(async(() => {
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
