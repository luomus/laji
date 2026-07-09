import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ValidationAudio } from 'projects/bsg/src/app/bsg-shared/models';

@Component({
    selector: 'bsg-audio-info',
    templateUrl: './audio-info.component.html',
    styleUrls: ['./audio-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AudioInfoComponent {
  @Input({ required: true }) audio!: ValidationAudio;
}
