import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RedListHabitatComponent } from './red-list-habitat.component';

describe('RedListHabitatComponent', () => {
  let component: RedListHabitatComponent;
  let fixture: ComponentFixture<RedListHabitatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RedListHabitatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedListHabitatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
