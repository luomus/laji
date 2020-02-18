import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationItemStatusComponent } from './annotation-item-status.component';

describe('AnnotationItemStatusComponent', () => {
  let component: AnnotationItemStatusComponent;
  let fixture: ComponentFixture<AnnotationItemStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationItemStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationItemStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
