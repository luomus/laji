import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ThemeBreadcrumbComponent } from './theme-breadcrumb.component';

describe('ThemeBreadcrumbComponent', () => {
  let component: ThemeBreadcrumbComponent;
  let fixture: ComponentFixture<ThemeBreadcrumbComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
