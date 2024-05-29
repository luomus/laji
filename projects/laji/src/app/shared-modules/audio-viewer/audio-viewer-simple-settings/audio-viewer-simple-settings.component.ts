import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-audio-viewer-simple-settings',
  templateUrl: './audio-viewer-simple-settings.component.html',
  styleUrls: ['./audio-viewer-simple-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerSimpleSettingsComponent {
  @Input() enableSlowDownAudioSetting = false;
  @Input() slowDownAudio = false;

  @Input() enableShowWholeFrequencyRangeSetting = true;
  @Input() showWholeFrequencyRange = false;
  @Input() showWholeFrequencyRangeLabel = '';
  @Input() showWholeFrequencyRangeInfo = '';

  @Input() enableShowWholeTimeRangeSetting = true;
  @Input() showWholeTimeRange = false;
  @Input() showWholeTimeRangeLabel = '';
  @Input() showWholeTimeRangeInfo = '';

  @Output() slowDownAudioChange = new EventEmitter<boolean>();
  @Output() showWholeFrequencyRangeChange = new EventEmitter<boolean>();
  @Output() showWholeTimeRangeChange = new EventEmitter<boolean>();
}
