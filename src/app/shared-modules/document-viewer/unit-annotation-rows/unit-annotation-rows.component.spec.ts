import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitAnnotationRowsComponent } from './unit-annotation-rows.component';

describe('UnitAnnotationRowsComponent', () => {
  let component: UnitAnnotationRowsComponent;
  let fixture: ComponentFixture<UnitAnnotationRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitAnnotationRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAnnotationRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
