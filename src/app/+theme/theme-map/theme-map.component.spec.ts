import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeMapComponent } from './theme-map.component';

describe('ThemeMapComponent', () => {
  let component: ThemeMapComponent;
  let fixture: ComponentFixture<ThemeMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
