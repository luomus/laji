import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-audio-viewer-bat-settings',
  templateUrl: './audio-viewer-bat-settings.component.html',
  styleUrls: ['./audio-viewer-bat-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerBatSettingsComponent {
  @Input() showWholeTimeRange = false;
  @Input() showWholeTimeRangeLabel = '';
  @Input() showWholeTimeRangeInfo = '';

  @Output() showWholeTimeRangeChange = new EventEmitter<boolean>();
}
