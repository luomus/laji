import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioSpectrogramComponent } from './audio-spectrogram.component';

describe('AudioSpectrogramComponent', () => {
  let component: AudioSpectrogramComponent;
  let fixture: ComponentFixture<AudioSpectrogramComponent>;

  beforeEach(async(() => {
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
