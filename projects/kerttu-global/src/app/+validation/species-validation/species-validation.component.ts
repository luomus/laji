import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { IAudioViewerArea, AudioViewerMode, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { ILetterAnnotation, IKerttuRecording, LetterAnnotation } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent implements OnChanges {
  @Input() data?: IKerttuRecording[];

  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      console.log(this.data);
    }
  }
}
