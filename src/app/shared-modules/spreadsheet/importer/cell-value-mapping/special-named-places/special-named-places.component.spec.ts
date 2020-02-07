import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialNamedPlacesComponent } from './special-named-places.component';

describe('SpecialNamedPlacesComponent', () => {
  let component: SpecialNamedPlacesComponent;
  let fixture: ComponentFixture<SpecialNamedPlacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialNamedPlacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialNamedPlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
