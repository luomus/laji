import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioViewerSimpleSettingsComponent } from './audio-viewer-simple-settings.component';

describe('AudioViewerSimpleSettingsComponent', () => {
  let component: AudioViewerSimpleSettingsComponent;
  let fixture: ComponentFixture<AudioViewerSimpleSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioViewerSimpleSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioViewerSimpleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
