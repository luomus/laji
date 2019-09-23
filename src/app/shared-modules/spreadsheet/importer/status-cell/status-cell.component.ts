import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IFormField } from '../../../../+haseka/tools/model/excel';

@Component({
  selector: 'laji-status-cell',
  templateUrl: './status-cell.component.html',
  styleUrls: ['./status-cell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusCellComponent implements OnInit {

  @Input() value: {
    status: 'ok'|'valid'|'invalid'|'fail'|'ignore',
    error: any
  };
  @Input() fields: {[key: string]: IFormField};

  constructor() { }

  ngOnInit() {
  }

}
