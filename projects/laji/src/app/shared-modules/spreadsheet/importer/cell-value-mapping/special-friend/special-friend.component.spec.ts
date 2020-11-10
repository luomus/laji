import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialFriendComponent } from './special-friend.component';

describe('SpecialFriendComponent', () => {
  let component: SpecialFriendComponent;
  let fixture: ComponentFixture<SpecialFriendComponent>;

  beforeEach(async(() => {
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
