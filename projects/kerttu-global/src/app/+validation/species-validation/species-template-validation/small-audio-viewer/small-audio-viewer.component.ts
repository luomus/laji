import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IAudioViewerArea, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-small-audio-viewer',
  templateUrl: './small-audio-viewer.component.html',
  styleUrls: ['./small-audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallAudioViewerComponent {
  @Input() audio?: IGlobalAudio;
  @Input() area?: IAudioViewerArea;
  @Input() spectrogramConfig?: ISpectrogramConfig;
  @Input() label?: string;
  @Input() highlight = false;
  @Input() highlightType: 'default'|'warning'|'danger';

  @Input() width = '20%';
  @Input() spectrogramHeight = 50;
  @Input() margin: { top: number; bottom: number; left: number; right: number } = { top: 0, bottom: 15, left: 20, right: 1 };

  @Output() templateClick = new EventEmitter<number>();
  @Output() audioLoading = new EventEmitter<boolean>();
}
