import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QualityFiltersComponent } from './quality-filters.component';

describe('QualityFiltersComponent', () => {
  let component: QualityFiltersComponent;
  let fixture: ComponentFixture<QualityFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QualityFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualityFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
