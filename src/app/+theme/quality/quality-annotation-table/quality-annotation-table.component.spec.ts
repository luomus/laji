import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityAnnotationTableComponent } from './quality-annotation-table.component';

describe('QualityAnnotationTableComponent', () => {
  let component: QualityAnnotationTableComponent;
  let fixture: ComponentFixture<QualityAnnotationTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualityAnnotationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualityAnnotationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
