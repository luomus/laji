import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldSettingsComponent } from './field-settings.component';

describe('FieldSettingsComponent', () => {
  let component: FieldSettingsComponent;
  let fixture: ComponentFixture<FieldSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
