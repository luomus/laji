import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialGeometryComponent } from './special-geometry.component';

describe('SpecialGeometryComponent', () => {
  let component: SpecialGeometryComponent;
  let fixture: ComponentFixture<SpecialGeometryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialGeometryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
