import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitatComponent } from './habitat.component';

describe('HabitatComponent', () => {
  let component: HabitatComponent;
  let fixture: ComponentFixture<HabitatComponent>;

  beforeEach(async(() => {
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
