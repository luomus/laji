import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationImagesComponent } from './annotation-images.component';

describe('AnnotationImagesComponent', () => {
  let component: AnnotationImagesComponent;
  let fixture: ComponentFixture<AnnotationImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotationImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
