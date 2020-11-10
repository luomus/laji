import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneticResourceInstructionsComponent } from './genetic-resource-instructions.component';

describe('InstructionsComponent', () => {
  let component: GeneticResourceInstructionsComponent;
  let fixture: ComponentFixture<GeneticResourceInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticResourceInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneticResourceInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
