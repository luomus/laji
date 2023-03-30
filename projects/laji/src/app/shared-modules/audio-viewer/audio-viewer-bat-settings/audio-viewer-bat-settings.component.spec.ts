import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioViewerBatSettingsComponent } from './audio-viewer-bat-settings.component';

describe('AudioViewerBatSettingsComponent', () => {
  let component: AudioViewerBatSettingsComponent;
  let fixture: ComponentFixture<AudioViewerBatSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioViewerBatSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioViewerBatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
