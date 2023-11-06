import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvasiveSpeciesControlResultStatisticsComponent } from './invasive-species-control-result-statistics.component';

describe('InvasiveSpeciesControlResultStatisticsComponent', () => {
  let component: InvasiveSpeciesControlResultStatisticsComponent;
  let fixture: ComponentFixture<InvasiveSpeciesControlResultStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvasiveSpeciesControlResultStatisticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvasiveSpeciesControlResultStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
