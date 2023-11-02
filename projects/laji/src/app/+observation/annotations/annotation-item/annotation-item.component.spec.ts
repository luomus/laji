import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationItemComponent } from './annotation-item.component';

describe('AnnotationItemComponent', () => {
  let component: AnnotationItemComponent;
  let fixture: ComponentFixture<AnnotationItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
