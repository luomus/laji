import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageByOrganizationComponent } from './usage-by-organization.component';

describe('UsageByPersonComponent', () => {
  let component: UsageByOrganizationComponent;
  let fixture: ComponentFixture<UsageByOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageByOrganizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageByOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
