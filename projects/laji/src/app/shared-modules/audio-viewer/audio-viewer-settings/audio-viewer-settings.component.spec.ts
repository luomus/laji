import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioViewerSettingsComponent } from './audio-viewer-settings.component';

describe('AudioViewerSettingsComponent', () => {
  let component: AudioViewerSettingsComponent;
  let fixture: ComponentFixture<AudioViewerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioViewerSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioViewerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
