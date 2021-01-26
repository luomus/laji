import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedlistYearSelectComponent } from './redlist-year-select.component';

describe('RedlistYearSelectComponent', () => {
  let component: RedlistYearSelectComponent;
  let fixture: ComponentFixture<RedlistYearSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedlistYearSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedlistYearSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
