import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbifMapComponent } from './gbif-map.component';

describe('GbifMapComponent', () => {
  let component: GbifMapComponent;
  let fixture: ComponentFixture<GbifMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbifMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbifMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
