import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedlistYearSelectComponent } from './redlist-year-select.component';

describe('RedlistYearSelectComponent', () => {
  let component: RedlistYearSelectComponent;
  let fixture: ComponentFixture<RedlistYearSelectComponent>;

  beforeEach(async(() => {
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
