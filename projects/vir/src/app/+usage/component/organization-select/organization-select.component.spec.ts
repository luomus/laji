import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSelectComponent } from './organization-select.component';

describe('OrganizationSelectComponent', () => {
  let component: OrganizationSelectComponent;
  let fixture: ComponentFixture<OrganizationSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
