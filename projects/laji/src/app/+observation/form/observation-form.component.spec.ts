import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationFormComponent } from './observation-form.component';

describe('ObservationFormComponent', () => {
  let component: ObservationFormComponent;
  let fixture: ComponentFixture<ObservationFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
