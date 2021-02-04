import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpecialNamedPlacesComponent } from './special-named-places.component';

describe('SpecialNamedPlacesComponent', () => {
  let component: SpecialNamedPlacesComponent;
  let fixture: ComponentFixture<SpecialNamedPlacesComponent>;

  beforeEach(waitForAsync(() => {
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
