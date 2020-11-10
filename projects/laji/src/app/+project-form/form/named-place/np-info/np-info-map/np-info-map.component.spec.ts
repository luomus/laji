import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpInfoMapComponent } from './np-info-map.component';

describe('NpInfoMapComponent', () => {
  let component: NpInfoMapComponent;
  let fixture: ComponentFixture<NpInfoMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpInfoMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpInfoMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
