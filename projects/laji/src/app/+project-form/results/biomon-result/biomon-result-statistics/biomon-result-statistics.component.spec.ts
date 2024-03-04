import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomonResultStatisticsComponent } from './biomon-result-statistics.component';

describe('BiomonResultStatisticsComponent', () => {
  let component: BiomonResultStatisticsComponent;
  let fixture: ComponentFixture<BiomonResultStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BiomonResultStatisticsComponent]
    });
    fixture = TestBed.createComponent(BiomonResultStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
