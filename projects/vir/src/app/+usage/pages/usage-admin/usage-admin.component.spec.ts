import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageAdminComponent } from './usage-admin.component';

describe('UsageAdminComponent', () => {
  let component: UsageAdminComponent;
  let fixture: ComponentFixture<UsageAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsageAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
