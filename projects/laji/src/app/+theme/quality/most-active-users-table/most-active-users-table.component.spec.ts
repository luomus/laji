import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MostActiveUsersTableComponent } from './most-active-users-table.component';

describe('MostActiveUsersTableComponent', () => {
  let component: MostActiveUsersTableComponent;
  let fixture: ComponentFixture<MostActiveUsersTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MostActiveUsersTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MostActiveUsersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
