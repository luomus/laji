import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IFormField } from '../../model/excel';

@Component({
  selector: 'laji-status-cell',
  templateUrl: './status-cell.component.html',
  styleUrls: ['./status-cell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusCellComponent {

  @Input() value: {
    status: 'ok'|'valid'|'invalid'|'fail'|'ignore',
    error: any
  };
  @Input() fields: {[key: string]: IFormField};

}
