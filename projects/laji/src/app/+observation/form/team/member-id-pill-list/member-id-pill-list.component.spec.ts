import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberIdPillListComponent } from './member-id-pill-list.component';

describe('MemberIdPillListComponent', () => {
  let component: MemberIdPillListComponent;
  let fixture: ComponentFixture<MemberIdPillListComponent>;

  beforeEach(async(() => {
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
