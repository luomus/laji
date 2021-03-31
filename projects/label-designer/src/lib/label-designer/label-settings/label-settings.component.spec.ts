import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelSettingsComponent } from './label-settings.component';

describe('LabelSettingsComponent', () => {
  let component: LabelSettingsComponent;
  let fixture: ComponentFixture<LabelSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
