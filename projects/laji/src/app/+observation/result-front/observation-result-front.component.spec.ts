import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationResultFrontComponent } from './observation-result-front.component';

describe('ObservationResultFrontComponent', () => {
  let component: ObservationResultFrontComponent;
  let fixture: ComponentFixture<ObservationResultFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservationResultFrontComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationResultFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
