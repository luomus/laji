import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndeterminateCheckboxComponent } from './indeterminate-checkbox.component';

describe('IndeterminateCheckboxComponent', () => {
  let component: IndeterminateCheckboxComponent;
  let fixture: ComponentFixture<IndeterminateCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndeterminateCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndeterminateCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
