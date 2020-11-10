import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdPointCountStatsComponent } from './bird-point-count-stats.component';

describe('BirdPointCountStatsComponent', () => {
  let component: BirdPointCountStatsComponent;
  let fixture: ComponentFixture<BirdPointCountStatsComponent>;

  beforeEach(async(() => {
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
