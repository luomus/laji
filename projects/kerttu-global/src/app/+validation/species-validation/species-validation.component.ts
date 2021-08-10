import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IKerttuLetterTemplate, IKerttuRecording } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent {
  @Input() data?: IKerttuRecording[];
  @Input() templates?: IKerttuLetterTemplate[];

  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  constructor() { }
}
