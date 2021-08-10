import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IKerttuLetterTemplate } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-letter-templates',
  templateUrl: './letter-templates.component.html',
  styleUrls: ['./letter-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterTemplatesComponent {
  @Input() templates: IKerttuLetterTemplate[];
  @Input() spectrogramConfig: ISpectrogramConfig;

  margin: { top: number, bottom: number, left: number, right: number } = { top: 0, bottom: 15, left: 20, right: 1};
}
