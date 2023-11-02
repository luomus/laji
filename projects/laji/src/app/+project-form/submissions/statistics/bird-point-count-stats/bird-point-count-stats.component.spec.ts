import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BirdPointCountStatsComponent } from './bird-point-count-stats.component';

describe('BirdPointCountStatsComponent', () => {
  let component: BirdPointCountStatsComponent;
  let fixture: ComponentFixture<BirdPointCountStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdPointCountStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdPointCountStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
