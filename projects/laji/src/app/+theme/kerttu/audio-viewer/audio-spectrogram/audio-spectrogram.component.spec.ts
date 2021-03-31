import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AudioSpectrogramComponent } from './audio-spectrogram.component';

describe('AudioSpectrogramComponent', () => {
  let component: AudioSpectrogramComponent;
  let fixture: ComponentFixture<AudioSpectrogramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioSpectrogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioSpectrogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
