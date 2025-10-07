import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { Audio, AudioViewerArea, AudioViewerFocusArea, SpectrogramConfig } from '../models';
import { defaultSpectrogramConfig } from '../variables';

@Component({
  selector: 'laji-small-audio-viewer',
  templateUrl: './small-audio-viewer.component.html',
  styleUrls: ['./small-audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallAudioViewerComponent implements OnChanges {
  @Input() audio?: Audio;
  @Input() sampleRate = 44100;
  @Input() area?: AudioViewerArea;
  @Input() areaColor?: string;
  @Input() areaTimePadding?: number;
  @Input() areaFrequencyPadding?: number;
  @Input() spectrogramConfig: SpectrogramConfig = defaultSpectrogramConfig;
  @Input() label?: string;
  @Input() highlight = false;
  @Input() highlightType?: 'default'|'warning'|'danger';

  @Input() width = '20%';
  @Input() spectrogramWidth?: number;
  @Input() spectrogramHeight = 50;
  @Input() margin: { top: number; bottom: number; left: number; right: number } = { top: 0, bottom: 15, left: 20, right: 1 };
  @Input() emptyAudioText = '';

  @Output() templateClick = new EventEmitter<number>();
  @Output() audioLoading = new EventEmitter<boolean>();

  focusArea?: AudioViewerFocusArea;

  ngOnChanges() {
    if (this.area) {
      this.focusArea = {
        area: this.area,
        color: this.areaColor,
        zoomTime: true,
        timePaddingOnZoom: this.areaTimePadding || 0.5,
        zoomFrequency: true,
        frequencyPaddingOnZoom: this.areaFrequencyPadding || 500
      };
    } else {
      this.focusArea = undefined;
    }
  }
}
