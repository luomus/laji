import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalResultsComponent } from './regional-results.component';

describe('RegionalResultsComponent', () => {
  let component: RegionalResultsComponent;
  let fixture: ComponentFixture<RegionalResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionalResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionalResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
