import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformalListBreadcrumbComponent } from './informal-list-breadcrumb.component';

describe('InformalListBreadcrumbComponent', () => {
  let component: InformalListBreadcrumbComponent;
  let fixture: ComponentFixture<InformalListBreadcrumbComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InformalListBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformalListBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
