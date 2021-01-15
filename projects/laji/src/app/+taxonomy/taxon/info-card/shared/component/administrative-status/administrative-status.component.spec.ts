import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdministrativeStatusComponent } from './administrative-status.component';

describe('AdministrativeStatusComponent', () => {
  let component: AdministrativeStatusComponent;
  let fixture: ComponentFixture<AdministrativeStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrativeStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrativeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
