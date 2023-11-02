import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThemeObservationListComponent } from './theme-observation-list.component';

describe('ThemeObservationListComponent', () => {
  let component: ThemeObservationListComponent;
  let fixture: ComponentFixture<ThemeObservationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeObservationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeObservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
