import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteListsResultStatisticsComponent } from './complete-lists-result-statistics.component';

describe('CompleteListsResultStatisticsComponent', () => {
  let component: CompleteListsResultStatisticsComponent;
  let fixture: ComponentFixture<CompleteListsResultStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteListsResultStatisticsComponent]
    });
    fixture = TestBed.createComponent(CompleteListsResultStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
