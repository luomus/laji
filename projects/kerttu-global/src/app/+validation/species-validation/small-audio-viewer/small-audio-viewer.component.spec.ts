import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallAudioViewerComponent } from './small-audio-viewer.component';

describe('SmallAudioViewerComponent', () => {
  let component: SmallAudioViewerComponent;
  let fixture: ComponentFixture<SmallAudioViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallAudioViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallAudioViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
