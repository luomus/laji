import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-audio-viewer-simple-settings',
  templateUrl: './audio-viewer-simple-settings.component.html',
  styleUrls: ['./audio-viewer-simple-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerSimpleSettingsComponent {
  @Input() showWholeFrequencyRange = false;
  @Input() showWholeTimeRange = false;
  @Input() showWholeFrequencyRangeLabel = '';
  @Input() showWholeTimeRangeLabel = '';

  @Output() showWholeFrequencyRangeChange = new EventEmitter<boolean>();
  @Output() showWholeTimeRangeChange = new EventEmitter<boolean>();
}
