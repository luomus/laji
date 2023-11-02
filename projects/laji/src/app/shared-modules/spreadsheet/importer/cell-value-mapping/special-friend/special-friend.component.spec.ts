import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpecialFriendComponent } from './special-friend.component';

describe('SpecialFriendComponent', () => {
  let component: SpecialFriendComponent;
  let fixture: ComponentFixture<SpecialFriendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialFriendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
