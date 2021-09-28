import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IGlobalTemplate } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-letter-templates',
  templateUrl: './letter-templates.component.html',
  styleUrls: ['./letter-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterTemplatesComponent {
  @Input() templates: IGlobalTemplate[];
  @Input() confirmedTemplates: boolean[];
  @Input() viewOnly = false;

  @Input() spectrogramConfig: ISpectrogramConfig;
  @Input() audioIdMap: {[id: number]: IGlobalAudio };

  @Output() templateClick = new EventEmitter<number>();

  margin: { top: number, bottom: number, left: number, right: number } = { top: 0, bottom: 15, left: 20, right: 1};
}
