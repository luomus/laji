import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField, IGNORE_VALUE } from '../../model/form-field';

@Component({
  selector: 'laji-mapping-select',
  templateUrl: './mapping-select.component.html',
  styleUrls: ['./mapping-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingSelectComponent implements OnInit {

  @Input() options: string[] = [];
  @Input() fields: {[key: string]: FormField};
  @Output() selected = new EventEmitter<string>();

  skipValue = IGNORE_VALUE;

  @Input() value: string;

  constructor() {}

  ngOnInit() {
  }
}
