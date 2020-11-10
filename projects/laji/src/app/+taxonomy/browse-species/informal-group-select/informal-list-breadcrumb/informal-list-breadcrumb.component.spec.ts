import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformalListBreadcrumbComponent } from './informal-list-breadcrumb.component';

describe('InformalListBreadcrumbComponent', () => {
  let component: InformalListBreadcrumbComponent;
  let fixture: ComponentFixture<InformalListBreadcrumbComponent>;

  beforeEach(async(() => {
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
