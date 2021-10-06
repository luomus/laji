import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectStyle } from '../../select/metadata-select/metadata-select.component';

@Component({
  selector: 'laji-download-modal-reason',
  templateUrl: './reason.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReasonComponent {
  basicSelectStyle = SelectStyle.basic;
  @Input() reason = '';
  @Input() reasonEnum = '';

  @Output() reasonChange = new EventEmitter<string>();
  @Output() reasonEnumChange = new EventEmitter<string>();
}
