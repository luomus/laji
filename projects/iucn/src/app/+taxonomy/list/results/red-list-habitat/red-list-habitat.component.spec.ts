import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedListHabitatComponent } from './red-list-habitat.component';

describe('RedListHabitatComponent', () => {
  let component: RedListHabitatComponent;
  let fixture: ComponentFixture<RedListHabitatComponent>;

  beforeEach(async(() => {
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
