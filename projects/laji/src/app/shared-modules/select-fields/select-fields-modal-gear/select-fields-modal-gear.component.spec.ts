import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectFieldsModalGearComponent } from './select-fields-modal-gear.component';

describe('SelectFieldsModalGearComponent', () => {
  let component: SelectFieldsModalGearComponent;
  let fixture: ComponentFixture<SelectFieldsModalGearComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFieldsModalGearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFieldsModalGearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
