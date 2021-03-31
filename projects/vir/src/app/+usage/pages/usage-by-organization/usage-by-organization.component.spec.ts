import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UsageByOrganizationComponent } from './usage-by-organization.component';

describe('UsageByPersonComponent', () => {
  let component: UsageByOrganizationComponent;
  let fixture: ComponentFixture<UsageByOrganizationComponent>;

  beforeEach(waitForAsync(() => {
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
