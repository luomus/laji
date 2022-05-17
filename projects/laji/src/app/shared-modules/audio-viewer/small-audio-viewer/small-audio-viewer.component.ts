import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IAudio, IAudioViewerArea, ISpectrogramConfig } from '../models';
import { defaultSpectrogramConfig } from '../variables';

@Component({
  selector: 'laji-small-audio-viewer',
  templateUrl: './small-audio-viewer.component.html',
  styleUrls: ['./small-audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallAudioViewerComponent {
  @Input() audio?: IAudio;
  @Input() area?: IAudioViewerArea;
  @Input() areaColor?: string;
  @Input() spectrogramConfig?: ISpectrogramConfig = defaultSpectrogramConfig;
  @Input() label?: string;
  @Input() highlight = false;
  @Input() highlightType: 'default'|'warning'|'danger';

  @Input() width = '20%';
  @Input() spectrogramWidth?: number;
  @Input() spectrogramHeight = 50;
  @Input() margin: { top: number; bottom: number; left: number; right: number } = { top: 0, bottom: 15, left: 20, right: 1 };
  @Input() emptyAudioText = '';

  @Output() templateClick = new EventEmitter<number>();
  @Output() audioLoading = new EventEmitter<boolean>();
}
