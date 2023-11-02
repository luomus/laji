import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesTemplateValidationComponent } from './species-template-validation.component';

describe('SpeciesTemplateValidationComponent', () => {
  let component: SpeciesTemplateValidationComponent;
  let fixture: ComponentFixture<SpeciesTemplateValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeciesTemplateValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesTemplateValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
