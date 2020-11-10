import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeObservationListComponent } from './theme-observation-list.component';

describe('ThemeObservationListComponent', () => {
  let component: ThemeObservationListComponent;
  let fixture: ComponentFixture<ThemeObservationListComponent>;

  beforeEach(async(() => {
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
