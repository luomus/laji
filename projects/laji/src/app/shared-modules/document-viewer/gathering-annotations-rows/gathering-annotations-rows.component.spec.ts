import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatheringAnnotationsRowsComponent } from './gathering-annotations-rows.component';

describe('GatheringAnnotationsRowsComponent', () => {
  let component: GatheringAnnotationsRowsComponent;
  let fixture: ComponentFixture<GatheringAnnotationsRowsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatheringAnnotationsRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatheringAnnotationsRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
