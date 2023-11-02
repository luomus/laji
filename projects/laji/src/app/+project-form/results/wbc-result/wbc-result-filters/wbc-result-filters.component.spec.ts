import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcResultFiltersComponent } from './wbc-result-filters.component';

describe('WbcResultFiltersComponent', () => {
  let component: WbcResultFiltersComponent;
  let fixture: ComponentFixture<WbcResultFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcResultFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcResultFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
