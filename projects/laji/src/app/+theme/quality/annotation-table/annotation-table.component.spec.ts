import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationTableComponent } from './annotation-table.component';

describe('QualityAnnotationTableComponent', () => {
  let component: AnnotationTableComponent;
  let fixture: ComponentFixture<AnnotationTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
