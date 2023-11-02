import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MemberIdPillListComponent } from './member-id-pill-list.component';

describe('MemberIdPillListComponent', () => {
  let component: MemberIdPillListComponent;
  let fixture: ComponentFixture<MemberIdPillListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberIdPillListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberIdPillListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
