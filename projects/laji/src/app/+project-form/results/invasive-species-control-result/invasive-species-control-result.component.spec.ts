import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvasiveSpeciesControlResultComponent } from './invasive-species-control-result.component';

describe('InvasiveSpeciesControlResultComponent', () => {
  let component: InvasiveSpeciesControlResultComponent;
  let fixture: ComponentFixture<InvasiveSpeciesControlResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvasiveSpeciesControlResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvasiveSpeciesControlResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
