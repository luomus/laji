import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IGlobalAudio } from 'projects/kerttu-global/src/app/kerttu-global-shared/models';

@Component({
  selector: 'bsg-cornell-audio-info',
  templateUrl: './cornell-audio-info.component.html',
  styleUrls: ['./cornell-audio-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CornellAudioInfoComponent {
  @Input() audio: IGlobalAudio;
}
