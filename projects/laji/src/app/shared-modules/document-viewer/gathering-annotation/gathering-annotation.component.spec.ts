import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatheringAnnotationComponent } from './gathering-annotation.component';

describe('GatheringAnnotationComponent', () => {
  let component: GatheringAnnotationComponent;
  let fixture: ComponentFixture<GatheringAnnotationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatheringAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatheringAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
