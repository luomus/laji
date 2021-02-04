import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedListHabitatListComponent } from './red-list-habitat-list.component';

describe('RedListHabitatListComponent', () => {
  let component: RedListHabitatListComponent;
  let fixture: ComponentFixture<RedListHabitatListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListHabitatListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListHabitatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
