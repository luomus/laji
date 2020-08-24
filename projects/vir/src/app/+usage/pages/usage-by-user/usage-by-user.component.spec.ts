import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageByUserComponent } from './usage-by-user.component';

describe('UsageByPersonComponent', () => {
  let component: UsageByUserComponent;
  let fixture: ComponentFixture<UsageByUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageByUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageByUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
