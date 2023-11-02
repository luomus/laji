import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WbcTableFilterComponent } from './wbc-table-filter.component';

describe('WbcTableFilterComponent', () => {
  let component: WbcTableFilterComponent;
  let fixture: ComponentFixture<WbcTableFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcTableFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
