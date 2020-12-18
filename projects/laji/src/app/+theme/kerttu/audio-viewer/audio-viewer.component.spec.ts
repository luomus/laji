import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AudioViewerComponent } from './audio-viewer.component';

describe('AudioViewerComponent', () => {
  let component: AudioViewerComponent;
  let fixture: ComponentFixture<AudioViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
