import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'bsg-audio-viewer-custom-controls',
  templateUrl: './audio-viewer-custom-controls.component.html',
  styleUrls: ['./audio-viewer-custom-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerCustomControlsComponent {
  @Input() enableShowWholeFrequencyRangeSetting = true;
  @Input() showWholeFrequencyRange = false;
  @Input() showWholeFrequencyRangeLabel = '';
  @Input() showWholeFrequencyRangeInfo = '';

  @Input() enableShowWholeTimeRangeSetting = true;
  @Input() showWholeTimeRange = false;
  @Input() showWholeTimeRangeLabel = '';
  @Input() showWholeTimeRangeInfo = '';

  @Output() showWholeFrequencyRangeChange = new EventEmitter<boolean>();
  @Output() showWholeTimeRangeChange = new EventEmitter<boolean>();
}
