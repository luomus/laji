import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvasiveSpeciesControlResultMapComponent } from './invasive-species-control-result-map.component';

describe('InvasiveSpeciesControlResultMapComponent', () => {
  let component: InvasiveSpeciesControlResultMapComponent;
  let fixture: ComponentFixture<InvasiveSpeciesControlResultMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvasiveSpeciesControlResultMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvasiveSpeciesControlResultMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
