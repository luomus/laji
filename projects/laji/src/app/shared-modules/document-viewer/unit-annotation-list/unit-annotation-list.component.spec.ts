import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitAnnotationListComponent } from './unit-annotation-list.component';

describe('UnitAnnotationListComponent', () => {
  let component: UnitAnnotationListComponent;
  let fixture: ComponentFixture<UnitAnnotationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitAnnotationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitAnnotationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
