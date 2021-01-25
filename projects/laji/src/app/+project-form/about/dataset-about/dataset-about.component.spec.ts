import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenericInstructionsComponent } from './generic-instructions.component';

describe('GenericInstructionsComponent', () => {
  let component: GenericInstructionsComponent;
  let fixture: ComponentFixture<GenericInstructionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
