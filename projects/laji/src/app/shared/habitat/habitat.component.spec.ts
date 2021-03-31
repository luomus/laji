import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HabitatComponent } from './habitat.component';

describe('HabitatComponent', () => {
  let component: HabitatComponent;
  let fixture: ComponentFixture<HabitatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HabitatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
