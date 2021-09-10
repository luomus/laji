import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IAudioViewerArea, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IGlobalTemplate } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-small-audio-viewer',
  templateUrl: './small-audio-viewer.component.html',
  styleUrls: ['./small-audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallAudioViewerComponent {
  @Input() area: IAudioViewerArea;
  @Input() spectrogramConfig: ISpectrogramConfig;
  @Input() audio: IGlobalAudio;
  @Input() label: string;
  @Input() highlight = false;

  @Output() templateClick = new EventEmitter<number>();
  @Output() audioLoading = new EventEmitter<boolean>();

  margin: { top: number, bottom: number, left: number, right: number } = { top: 0, bottom: 15, left: 20, right: 1 };
}
