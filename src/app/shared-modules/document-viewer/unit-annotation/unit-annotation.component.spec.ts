import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitAnnotationComponent } from './unit-annotation.component';

describe('UnitAnnotationComponent', () => {
  let component: UnitAnnotationComponent;
  let fixture: ComponentFixture<UnitAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
