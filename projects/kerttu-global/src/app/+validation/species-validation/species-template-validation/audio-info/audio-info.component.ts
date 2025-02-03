import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IGlobalAudio } from 'projects/kerttu-global/src/app/kerttu-global-shared/models';

@Component({
  selector: 'bsg-audio-info',
  templateUrl: './audio-info.component.html',
  styleUrls: ['./audio-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioInfoComponent {
  @Input({ required: true }) audio!: IGlobalAudio;
}
