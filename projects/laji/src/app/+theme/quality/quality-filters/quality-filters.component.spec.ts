import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityFiltersComponent } from './quality-filters.component';

describe('QualityFiltersComponent', () => {
  let component: QualityFiltersComponent;
  let fixture: ComponentFixture<QualityFiltersComponent>;

  beforeEach(async(() => {
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
