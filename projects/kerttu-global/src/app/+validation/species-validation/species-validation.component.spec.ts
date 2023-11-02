import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesValidationComponent } from './species-validation.component';

describe('SpeciesValidationComponent', () => {
  let component: SpeciesValidationComponent;
  let fixture: ComponentFixture<SpeciesValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeciesValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
